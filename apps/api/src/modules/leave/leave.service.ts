import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Cron, CronExpression } from '@nestjs/schedule'
import { EventEmitter2 } from '@nestjs/event-emitter'
import {
  LeaveRequest,
  LeaveRequestDocument,
  LeaveBalance,
  LeaveBalanceDocument,
  LeavePolicy,
  SubstituteAssignment,
  SubstituteAssignmentDocument,
  LeaveType,
  LeaveStatus,
} from './schemas/leave.schema'
import { NotificationsService } from '../notifications/notifications.service'
import { CloudinaryService } from '../../common/services/cloudinary.service'

@Injectable()
export class LeaveService {
  private readonly logger = new Logger(LeaveService.name)

  constructor(
    @InjectModel(LeaveRequest.name) private leaveRequestModel: Model<LeaveRequestDocument>,
    @InjectModel(LeaveBalance.name) private leaveBalanceModel: Model<LeaveBalanceDocument>,
    @InjectModel(LeavePolicy.name) private leavePolicyModel: Model<LeavePolicy>,
    @InjectModel(SubstituteAssignment.name)
    private substituteModel: Model<SubstituteAssignmentDocument>,
    private notificationsService: NotificationsService,
    private cloudinaryService: CloudinaryService,
    private eventEmitter: EventEmitter2,
  ) {}

  // ── Apply for Leave ──────────────────────────────────────────────────────

  async applyForLeave(
    userId: string,
    schoolId: string,
    branchId: string,
    dto: {
      leaveType: LeaveType
      startDate: Date
      endDate: Date
      reason: string
      halfDayPart?: 'MORNING' | 'AFTERNOON'
      handoverNotes?: string
      substituteTeacherId?: string
      document?: Express.Multer.File
    },
  ) {
    // 1. Get leave policy
    const policy = await this.leavePolicyModel.findOne({
      schoolId: new Types.ObjectId(schoolId),
      leaveType: dto.leaveType,
      isActive: true,
    })

    if (!policy) throw new BadRequestException(`Leave type ${dto.leaveType} is not configured`)

    // 2. Calculate duration
    const durationDays = this.calculateLeaveDuration(
      dto.startDate,
      dto.endDate,
      dto.halfDayPart,
    )

    // 3. Check balance
    const balance = await this.getOrCreateBalance(userId, schoolId, dto.leaveType)
    const available = balance.totalDays + balance.carriedOverDays - balance.usedDays - balance.pendingDays

    if (available < durationDays && policy.isPaid) {
      throw new BadRequestException(
        `Insufficient leave balance. Available: ${available} days, Requested: ${durationDays} days`,
      )
    }

    // 4. Check blackout periods
    this.checkBlackoutPeriods(policy.blackoutPeriods, dto.startDate, dto.endDate)

    // 5. Check for overlapping requests
    const overlap = await this.leaveRequestModel.findOne({
      userId: new Types.ObjectId(userId),
      status: { $in: [LeaveStatus.PENDING, LeaveStatus.APPROVED, LeaveStatus.PENDING_BRANCH_ADMIN, LeaveStatus.PENDING_HR] },
      $or: [
        { startDate: { $lte: dto.endDate }, endDate: { $gte: dto.startDate } },
      ],
    })
    if (overlap) throw new BadRequestException('You have an overlapping leave request')

    // 6. Check staffing adequacy
    const conflicts = await this.checkStaffingAdequacy(branchId, dto.startDate, dto.endDate, policy.minStaffingPercent)

    // 7. Upload document to Cloudinary if provided
    let documentUrl: string | undefined
    let documentPublicId: string | undefined
    if (dto.document) {
      const upload = await this.cloudinaryService.uploadDocument(
        dto.document,
        `edusuite/leave-docs/${schoolId}`,
        `leave_${userId}_${Date.now()}`,
      )
      documentUrl = upload.secureUrl
      documentPublicId = upload.publicId
    }

    // 8. Determine initial status based on approval levels
    const firstLevel = policy.approvalLevels[0]
    const initialStatus = this.levelToStatus(firstLevel)

    // 9. Create leave request
    const leaveRequest = await this.leaveRequestModel.create({
      schoolId: new Types.ObjectId(schoolId),
      branchId: new Types.ObjectId(branchId),
      userId: new Types.ObjectId(userId),
      leaveType: dto.leaveType,
      startDate: dto.startDate,
      endDate: dto.endDate,
      durationDays,
      halfDayPart: dto.halfDayPart,
      reason: dto.reason,
      documentUrl,
      documentPublicId,
      handoverNotes: dto.handoverNotes,
      substituteTeacherId: dto.substituteTeacherId ? new Types.ObjectId(dto.substituteTeacherId) : undefined,
      status: initialStatus,
      hasConflict: conflicts.length > 0,
      conflictDetails: conflicts,
      payDeductionDays: policy.isPaid ? 0 : durationDays,
    })

    // 10. Reserve balance (pending)
    await this.leaveBalanceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), leaveType: dto.leaveType, year: new Date().getFullYear() },
      { $inc: { pendingDays: durationDays } },
    )

    // 11. Notify approver
    await this.notifyApprovers(leaveRequest, policy, schoolId, branchId)

    // 12. If substitute needed, notify them
    if (dto.substituteTeacherId) {
      await this.createSubstituteAssignment(leaveRequest, dto.substituteTeacherId, schoolId)
    }

    this.eventEmitter.emit('leave.applied', { leaveRequest, userId, schoolId })
    return leaveRequest
  }

  // ── Approve/Reject Leave ─────────────────────────────────────────────────

  async processLeave(
    leaveRequestId: string,
    approverId: string,
    schoolId: string,
    action: 'APPROVE' | 'REJECT',
    comment?: string,
  ) {
    const leaveRequest = await this.leaveRequestModel.findOne({
      _id: new Types.ObjectId(leaveRequestId),
      schoolId: new Types.ObjectId(schoolId),
    })

    if (!leaveRequest) throw new NotFoundException('Leave request not found')

    if (leaveRequest.status === LeaveStatus.APPROVED || leaveRequest.status === LeaveStatus.REJECTED) {
      throw new BadRequestException('Leave request already processed')
    }

    const policy = await this.leavePolicyModel.findOne({
      schoolId: leaveRequest.schoolId,
      leaveType: leaveRequest.leaveType,
    })

    const approvalEntry = {
      level: leaveRequest.status,
      approverId: new Types.ObjectId(approverId),
      action,
      comment,
      date: new Date(),
    }

    if (action === 'REJECT') {
      // Rejected at any level → final rejection
      await this.leaveRequestModel.findByIdAndUpdate(leaveRequestId, {
        status: LeaveStatus.REJECTED,
        rejectionReason: comment,
        $push: { approvalHistory: approvalEntry },
      })

      // Release pending balance
      await this.leaveBalanceModel.findOneAndUpdate(
        {
          userId: leaveRequest.userId,
          leaveType: leaveRequest.leaveType,
          year: new Date().getFullYear(),
        },
        { $inc: { pendingDays: -leaveRequest.durationDays } },
      )

      // Notify applicant
      await this.notificationsService.send({
        recipientId: leaveRequest.userId.toString(),
        type: 'LEAVE',
        title: 'Leave Request Rejected',
        body: `Your ${leaveRequest.leaveType} leave request has been rejected. ${comment || ''}`,
        priority: 'HIGH',
      })

      this.eventEmitter.emit('leave.rejected', { leaveRequest, approverId })
    } else {
      // Check if this is the last approval level
      const currentLevelIndex = policy!.approvalLevels.indexOf(
        this.statusToLevel(leaveRequest.status),
      )
      const isLastLevel = currentLevelIndex === policy!.approvalLevels.length - 1

      if (isLastLevel) {
        // Final approval
        await this.leaveRequestModel.findByIdAndUpdate(leaveRequestId, {
          status: LeaveStatus.APPROVED,
          finalApprovedById: new Types.ObjectId(approverId),
          finalApprovalDate: new Date(),
          $push: { approvalHistory: approvalEntry },
        })

        // Deduct from balance
        await this.leaveBalanceModel.findOneAndUpdate(
          {
            userId: leaveRequest.userId,
            leaveType: leaveRequest.leaveType,
            year: new Date().getFullYear(),
          },
          {
            $inc: {
              pendingDays: -leaveRequest.durationDays,
              usedDays: leaveRequest.durationDays,
            },
          },
        )

        // Notify applicant
        await this.notificationsService.send({
          recipientId: leaveRequest.userId.toString(),
          type: 'LEAVE',
          title: 'Leave Request Approved',
          body: `Your ${leaveRequest.leaveType} leave from ${leaveRequest.startDate.toDateString()} to ${leaveRequest.endDate.toDateString()} has been approved.`,
          priority: 'HIGH',
        })

        this.eventEmitter.emit('leave.approved', { leaveRequest, approverId })
      } else {
        // Move to next approval level
        const nextLevel = policy!.approvalLevels[currentLevelIndex + 1]
        const nextStatus = this.levelToStatus(nextLevel)

        await this.leaveRequestModel.findByIdAndUpdate(leaveRequestId, {
          status: nextStatus,
          $push: { approvalHistory: approvalEntry },
        })

        // Notify next approver
        await this.notifyApprovers(
          { ...leaveRequest.toObject(), status: nextStatus },
          policy!,
          leaveRequest.schoolId.toString(),
          leaveRequest.branchId.toString(),
        )
      }
    }

    return this.leaveRequestModel.findById(leaveRequestId).lean()
  }

  // ── Cancel Leave ─────────────────────────────────────────────────────────

  async cancelLeave(leaveRequestId: string, userId: string, reason?: string) {
    const leaveRequest = await this.leaveRequestModel.findById(leaveRequestId)
    if (!leaveRequest) throw new NotFoundException('Leave request not found')

    if (leaveRequest.userId.toString() !== userId) {
      throw new ForbiddenException('You can only cancel your own leave')
    }

    if (leaveRequest.status === LeaveStatus.REJECTED || leaveRequest.status === LeaveStatus.CANCELLED) {
      throw new BadRequestException('Cannot cancel this leave request')
    }

    const isPending = [
      LeaveStatus.PENDING,
      LeaveStatus.PENDING_SUPERVISOR,
      LeaveStatus.PENDING_ACADEMIC_HEAD,
      LeaveStatus.PENDING_HR,
      LeaveStatus.PENDING_BRANCH_ADMIN,
    ].includes(leaveRequest.status)

    await this.leaveRequestModel.findByIdAndUpdate(leaveRequestId, {
      status: LeaveStatus.CANCELLED,
      rejectionReason: reason,
    })

    // Release balance
    if (isPending) {
      await this.leaveBalanceModel.findOneAndUpdate(
        { userId: leaveRequest.userId, leaveType: leaveRequest.leaveType, year: new Date().getFullYear() },
        { $inc: { pendingDays: -leaveRequest.durationDays } },
      )
    } else if (leaveRequest.status === LeaveStatus.APPROVED) {
      // Approved leave cancelled → refund used days
      await this.leaveBalanceModel.findOneAndUpdate(
        { userId: leaveRequest.userId, leaveType: leaveRequest.leaveType, year: new Date().getFullYear() },
        { $inc: { usedDays: -leaveRequest.durationDays } },
      )
    }

    return { message: 'Leave request cancelled' }
  }

  // ── Recall Approved Leave ────────────────────────────────────────────────

  async recallLeave(leaveRequestId: string, adminId: string, reason: string) {
    const leaveRequest = await this.leaveRequestModel.findById(leaveRequestId)
    if (!leaveRequest) throw new NotFoundException('Leave request not found')
    if (leaveRequest.status !== LeaveStatus.APPROVED) {
      throw new BadRequestException('Can only recall approved leave')
    }

    await this.leaveRequestModel.findByIdAndUpdate(leaveRequestId, {
      status: LeaveStatus.RECALLED,
      recalledById: new Types.ObjectId(adminId),
      recallReason: reason,
      recallDate: new Date(),
    })

    // Refund used days
    await this.leaveBalanceModel.findOneAndUpdate(
      { userId: leaveRequest.userId, leaveType: leaveRequest.leaveType, year: new Date().getFullYear() },
      { $inc: { usedDays: -leaveRequest.durationDays } },
    )

    await this.notificationsService.send({
      recipientId: leaveRequest.userId.toString(),
      type: 'LEAVE',
      title: 'Leave Recalled',
      body: `Your approved leave has been recalled. Reason: ${reason}. Please report to work.`,
      priority: 'URGENT',
    })

    return { message: 'Leave recalled successfully' }
  }

  // ── Get Leave Balance ────────────────────────────────────────────────────

  async getLeaveBalances(userId: string, schoolId: string, year?: number) {
    const targetYear = year || new Date().getFullYear()

    const balances = await this.leaveBalanceModel
      .find({
        userId: new Types.ObjectId(userId),
        schoolId: new Types.ObjectId(schoolId),
        year: targetYear,
      })
      .lean()

    // Compute available
    return balances.map((b) => ({
      ...b,
      availableDays: b.totalDays + b.carriedOverDays - b.usedDays - b.pendingDays,
    }))
  }

  // ── Leave Calendar ────────────────────────────────────────────────────────

  async getLeaveCalendar(branchId: string, month: number, year: number) {
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0)

    const leaves = await this.leaveRequestModel
      .find({
        branchId: new Types.ObjectId(branchId),
        status: LeaveStatus.APPROVED,
        startDate: { $lte: end },
        endDate: { $gte: start },
      })
      .populate('userId', 'firstName lastName role')
      .lean()

    return leaves
  }

  // ── Staffing Adequacy Check ───────────────────────────────────────────────

  async getStaffingAdequacy(branchId: string, date: Date): Promise<{
    totalStaff: number
    onLeave: number
    available: number
    percentage: number
    status: 'RED' | 'YELLOW' | 'GREEN'
  }> {
    const onLeave = await this.leaveRequestModel.countDocuments({
      branchId: new Types.ObjectId(branchId),
      status: LeaveStatus.APPROVED,
      startDate: { $lte: date },
      endDate: { $gte: date },
    })

    // This would join with Users to get total staff count
    const totalStaff = 20 // placeholder - would query users collection
    const available = totalStaff - onLeave
    const percentage = (available / totalStaff) * 100

    return {
      totalStaff,
      onLeave,
      available,
      percentage,
      status: percentage >= 70 ? 'GREEN' : percentage >= 50 ? 'YELLOW' : 'RED',
    }
  }

  // ── Leave Analytics ───────────────────────────────────────────────────────

  async getLeaveAnalytics(schoolId: string, year: number) {
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)

    const [byMonth, byType, bySickPattern, costAnalysis] = await Promise.all([
      // Leaves by month
      this.leaveRequestModel.aggregate([
        {
          $match: {
            schoolId: new Types.ObjectId(schoolId),
            status: LeaveStatus.APPROVED,
            startDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { month: { $month: '$startDate' } },
            count: { $sum: 1 },
            totalDays: { $sum: '$durationDays' },
          },
        },
        { $sort: { '_id.month': 1 } },
      ]),

      // Leaves by type
      this.leaveRequestModel.aggregate([
        {
          $match: {
            schoolId: new Types.ObjectId(schoolId),
            status: LeaveStatus.APPROVED,
            startDate: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$leaveType',
            count: { $sum: 1 },
            totalDays: { $sum: '$durationDays' },
          },
        },
      ]),

      // Sick leave Monday/Friday pattern (potential abuse detection)
      this.leaveRequestModel.aggregate([
        {
          $match: {
            schoolId: new Types.ObjectId(schoolId),
            leaveType: { $in: [LeaveType.SICK, LeaveType.EMERGENCY_SICK] },
            status: LeaveStatus.APPROVED,
            startDate: { $gte: start, $lte: end },
          },
        },
        {
          $addFields: {
            dayOfWeek: { $dayOfWeek: '$startDate' },
          },
        },
        {
          $group: {
            _id: '$dayOfWeek',
            count: { $sum: 1 },
          },
        },
      ]),

      // Substitute cost analysis
      this.substituteModel.aggregate([
        {
          $match: {
            schoolId: new Types.ObjectId(schoolId),
            paymentProcessed: true,
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: null,
            totalCost: { $sum: '$totalPayment' },
            totalSubstitutions: { $sum: 1 },
          },
        },
      ]),
    ])

    return { byMonth, byType, bySickPattern, costAnalysis: costAnalysis[0] || { totalCost: 0 } }
  }

  // ── Monthly Accrual (Cron Job) ────────────────────────────────────────────

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async accrueMonthlyLeave() {
    this.logger.log('Running monthly leave accrual...')

    const policies = await this.leavePolicyModel.find({
      accrues: true,
      accrualRatePerMonth: { $gt: 0 },
      isActive: true,
    })

    for (const policy of policies) {
      // Get all active staff for this school
      // In practice, would query Users by role + school
      this.logger.log(`Accruing ${policy.leaveType} for school ${policy.schoolId}`)

      // This would be: for each staff, add accrual to their balance
      // await this.leaveBalanceModel.updateMany(
      //   { schoolId: policy.schoolId, leaveType: policy.leaveType, year: currentYear },
      //   { $inc: { totalDays: policy.accrualRatePerMonth }, ... }
      // )
    }
  }

  // ── Year-End Processing ───────────────────────────────────────────────────

  @Cron('0 0 31 12 *') // Dec 31 midnight
  async processYearEndLeave() {
    this.logger.log('Processing year-end leave carry-over...')

    const policies = await this.leavePolicyModel.find({ maxCarryOverDays: { $gt: 0 } })

    for (const policy of policies) {
      const currentYear = new Date().getFullYear()

      // Get all balances for this leave type
      const balances = await this.leaveBalanceModel.find({
        schoolId: policy.schoolId,
        leaveType: policy.leaveType,
        year: currentYear,
      })

      for (const balance of balances) {
        const available = balance.totalDays - balance.usedDays - balance.pendingDays
        const carryOver = Math.min(available, policy.maxCarryOverDays)

        // Create next year balance with carry-over
        await this.leaveBalanceModel.findOneAndUpdate(
          { userId: balance.userId, leaveType: policy.leaveType, year: currentYear + 1 },
          { $set: { carriedOverDays: carryOver, schoolId: policy.schoolId }, $setOnInsert: { totalDays: policy.defaultDays, usedDays: 0, pendingDays: 0 } },
          { upsert: true },
        )
      }
    }
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private calculateLeaveDuration(start: Date, end: Date, halfDayPart?: string): number {
    if (halfDayPart) return 0.5

    let count = 0
    const current = new Date(start)
    while (current <= end) {
      const day = current.getDay()
      if (day !== 0 && day !== 6) count++ // Exclude weekends
      current.setDate(current.getDate() + 1)
    }
    return count
  }

  private checkBlackoutPeriods(blackoutPeriods: string[], start: Date, end: Date) {
    for (const period of blackoutPeriods) {
      const [bStart, bEnd] = period.split('/')
      if (start <= new Date(bEnd) && end >= new Date(bStart)) {
        throw new BadRequestException(`Leave cannot be taken during blackout period: ${period}`)
      }
    }
  }

  private async checkStaffingAdequacy(
    branchId: string,
    start: Date,
    end: Date,
    minPercent: number,
  ): Promise<string[]> {
    const conflicts: string[] = []
    if (!minPercent) return conflicts

    const adequacy = await this.getStaffingAdequacy(branchId, start)
    if (adequacy.status === 'RED') {
      conflicts.push(`Staffing below minimum on ${start.toDateString()}: ${adequacy.percentage.toFixed(0)}% available`)
    }
    return conflicts
  }

  private async getOrCreateBalance(userId: string, schoolId: string, leaveType: LeaveType) {
    const year = new Date().getFullYear()
    const policy = await this.leavePolicyModel.findOne({ schoolId: new Types.ObjectId(schoolId), leaveType })

    return this.leaveBalanceModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), schoolId: new Types.ObjectId(schoolId), leaveType, year },
      { $setOnInsert: { totalDays: policy?.defaultDays || 0, usedDays: 0, pendingDays: 0, carriedOverDays: 0 } },
      { upsert: true, new: true },
    )
  }

  private async createSubstituteAssignment(leaveRequest: any, substituteId: string, schoolId: string) {
    await this.substituteModel.create({
      leaveRequestId: leaveRequest._id,
      schoolId: new Types.ObjectId(schoolId),
      originalTeacherId: leaveRequest.userId,
      substituteTeacherId: new Types.ObjectId(substituteId),
      startDate: leaveRequest.startDate,
      endDate: leaveRequest.endDate,
      status: 'PENDING',
    })

    await this.notificationsService.send({
      recipientId: substituteId,
      type: 'LEAVE',
      title: 'Substitute Assignment',
      body: `You have been requested as a substitute teacher from ${leaveRequest.startDate.toDateString()} to ${leaveRequest.endDate.toDateString()}.`,
      priority: 'HIGH',
    })
  }

  private async notifyApprovers(leaveRequest: any, policy: any, schoolId: string, branchId: string) {
    // Would look up users with approver roles and notify them
    this.logger.log(`Notifying approvers for leave ${leaveRequest._id}`)
  }

  private levelToStatus(level: string): LeaveStatus {
    const map: Record<string, LeaveStatus> = {
      SUPERVISOR: LeaveStatus.PENDING_SUPERVISOR,
      ACADEMIC_HEAD: LeaveStatus.PENDING_ACADEMIC_HEAD,
      HR: LeaveStatus.PENDING_HR,
      BRANCH_ADMIN: LeaveStatus.PENDING_BRANCH_ADMIN,
      CENTRAL_ADMIN: LeaveStatus.PENDING_CENTRAL_ADMIN,
    }
    return map[level] || LeaveStatus.PENDING
  }

  private statusToLevel(status: LeaveStatus): string {
    const map: Record<string, string> = {
      [LeaveStatus.PENDING_SUPERVISOR]: 'SUPERVISOR',
      [LeaveStatus.PENDING_ACADEMIC_HEAD]: 'ACADEMIC_HEAD',
      [LeaveStatus.PENDING_HR]: 'HR',
      [LeaveStatus.PENDING_BRANCH_ADMIN]: 'BRANCH_ADMIN',
      [LeaveStatus.PENDING_CENTRAL_ADMIN]: 'CENTRAL_ADMIN',
    }
    return map[status] || 'HR'
  }
}
