import { Injectable, Logger, Controller, Get, Query, UseGuards, Module } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles, CurrentUser, SchoolId } from '../../common/decorators/roles.decorator'
import { UserRole } from '@edusuite/shared-types'

// We'll use dynamic model injection via connection to avoid circular deps
import { InjectConnection } from '@nestjs/mongoose'
import { Connection } from 'mongoose'

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name)

  constructor(
    @InjectConnection() private connection: Connection,
  ) {}

  private model(name: string) {
    return this.connection.model(name)
  }

  async getAdminDashboard(schoolId: string) {
    const sid = new Types.ObjectId(schoolId)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalStudents,
      totalStaff,
      totalActive,
      todayAttendance,
      recentPayments,
      overdueInvoices,
      upcomingExams,
      pendingLeave,
    ] = await Promise.allSettled([
      this.safeCount('Student', { schoolId: sid, status: 'active' }),
      this.safeCount('User', { schoolId: sid, isActive: true, role: { $nin: ['student', 'parent', 'super_admin'] } }),
      this.safeCount('Student', { schoolId: sid, status: 'active' }),
      this.safeAggregate('Attendance', [
        { $match: { schoolId: sid, date: today } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.safeAggregate('Payment', [
        { $match: { schoolId: sid, paymentDate: { $gte: today }, status: 'success' } },
        { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.safeCount('Invoice', {
        schoolId: sid,
        status: { $in: ['pending', 'partial', 'overdue'] },
        dueDate: { $lt: new Date() },
      }),
      this.safeFindMany('Exam', {
        schoolId: sid,
        startDate: { $gte: new Date() },
        status: { $in: ['scheduled', 'in_progress'] },
      }, 5),
      this.safeCount('LeaveRequest', { schoolId: sid, status: 'pending' }),
    ])

    const attendanceData = (todayAttendance as any).value || []
    const attendanceMap: Record<string, number> = {}
    for (const a of attendanceData) attendanceMap[a._id] = a.count

    const paymentsToday = ((recentPayments as any).value || [])[0]

    return {
      stats: {
        totalStudents: (totalStudents as any).value || 0,
        totalStaff: (totalStaff as any).value || 0,
        attendance: {
          present: attendanceMap['present'] || 0,
          absent: attendanceMap['absent'] || 0,
          late: attendanceMap['late'] || 0,
          rate: this.calcRate(attendanceMap['present'] || 0, (totalActive as any).value || 1),
        },
        finance: {
          collectedToday: paymentsToday?.total || 0,
          transactionsToday: paymentsToday?.count || 0,
          overdueInvoices: (overdueInvoices as any).value || 0,
        },
        upcomingExams: (upcomingExams as any).value || [],
        pendingLeaveRequests: (pendingLeave as any).value || 0,
      },
      generatedAt: new Date(),
    }
  }

  async getStudentDashboard(userId: string, schoolId: string) {
    const sid = new Types.ObjectId(schoolId)
    const uid = new Types.ObjectId(userId)

    const student = await this.safeFindOne('Student', { userId: uid }).catch(() => null)
    if (!student) return { message: 'Student profile not found' }

    const studentId = student._id

    const [attendanceStats, recentScores, pendingAssignments, gamificationData] = await Promise.allSettled([
      this.safeAggregate('Attendance', [
        { $match: { studentId, schoolId: sid } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.safeFindMany('ExamScore', { studentId, schoolId: sid }, 5, { createdAt: -1 }),
      this.safeCount('Assignment', {
        classId: student.classId,
        schoolId: sid,
        dueDate: { $gte: new Date() },
        'submissions.studentId': { $ne: studentId },
      }),
      this.safeFindOne('Student', { _id: studentId }).then((s: any) => ({
        totalXp: s?.totalXp || 0,
        level: s?.level || 1,
        loginStreak: s?.loginStreak || 0,
      })).catch(() => ({ totalXp: 0, level: 1, loginStreak: 0 })),
    ])

    const att = (attendanceStats as any).value || []
    const attMap: Record<string, number> = {}
    for (const a of att) attMap[a._id] = a.count
    const total = Object.values(attMap).reduce((s: number, v: any) => s + v, 0) as number
    const present = (attMap['present'] || 0) + (attMap['late'] || 0)

    return {
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        admissionNumber: student.admissionNumber,
        currentClass: student.currentClass,
        profilePicture: student.profilePicture,
      },
      attendance: {
        present,
        absent: attMap['absent'] || 0,
        total,
        rate: total > 0 ? Math.round((present / total) * 100) : 0,
      },
      recentScores: (recentScores as any).value || [],
      pendingAssignments: (pendingAssignments as any).value || 0,
      gamification: (gamificationData as any).value || { totalXp: 0, level: 1, loginStreak: 0 },
      generatedAt: new Date(),
    }
  }

  async getTeacherDashboard(userId: string, schoolId: string) {
    const sid = new Types.ObjectId(schoolId)
    const uid = new Types.ObjectId(userId)

    const [myClasses, pendingGrading, todaySchedule, myStudentCount] = await Promise.allSettled([
      this.safeFindMany('ClassRoom', { schoolId: sid, 'subjects.teacherId': uid, isActive: true }, 10),
      this.safeCount('Assignment', { schoolId: sid, 'subjects.teacherId': uid, 'submissions.grade': { $exists: false } }),
      this.safeFindMany('Timetable', { schoolId: sid, teacherId: uid }, 10),
      this.safeCount('Student', { schoolId: sid, classId: { $in: [] }, status: 'active' }),
    ])

    return {
      myClasses: (myClasses as any).value || [],
      pendingGrading: (pendingGrading as any).value || 0,
      todaySchedule: (todaySchedule as any).value || [],
      generatedAt: new Date(),
    }
  }

  async getParentDashboard(userId: string, schoolId: string) {
    const sid = new Types.ObjectId(schoolId)

    // Find children linked to this parent
    const children = await this.safeAggregate('Student', [
      { $match: { schoolId: sid, 'parents.userId': new Types.ObjectId(userId) } },
      {
        $lookup: {
          from: 'invoices',
          let: { sid: '$_id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$studentId', '$$sid'] }, status: { $in: ['pending', 'partial', 'overdue'] } } },
          ],
          as: 'pendingInvoices',
        },
      },
      {
        $project: {
          firstName: 1, lastName: 1, admissionNumber: 1, currentClass: 1,
          profilePicture: 1, feeBalance: 1, level: 1, totalXp: 1,
          pendingInvoicesCount: { $size: '$pendingInvoices' },
          totalAmountDue: { $sum: '$pendingInvoices.balance' },
        },
      },
    ]).catch(() => [])

    return {
      children,
      generatedAt: new Date(),
    }
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private async safeCount(modelName: string, filter: any): Promise<number> {
    try {
      return await this.connection.model(modelName).countDocuments(filter)
    } catch { return 0 }
  }

  private async safeAggregate(modelName: string, pipeline: any[]): Promise<any[]> {
    try {
      return await this.connection.model(modelName).aggregate(pipeline)
    } catch { return [] }
  }

  private async safeFindMany(modelName: string, filter: any, limit = 10, sort: any = { createdAt: -1 }): Promise<any[]> {
    try {
      return await this.connection.model(modelName).find(filter).sort(sort).limit(limit)
    } catch { return [] }
  }

  private async safeFindOne(modelName: string, filter: any): Promise<any> {
    try {
      return await this.connection.model(modelName).findOne(filter)
    } catch { return null }
  }

  private calcRate(value: number, total: number): number {
    if (total === 0) return 0
    return Math.round((value / total) * 100)
  }
}

// ─── Controller ────────────────────────────────────────────────────────────────

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('admin')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD, UserRole.ACCOUNTING_OFFICER)
  @ApiOperation({ summary: 'Admin dashboard with school-wide metrics' })
  getAdminDashboard(@SchoolId() schoolId: string) {
    return this.dashboardService.getAdminDashboard(schoolId)
  }

  @Get('student')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Student dashboard — attendance, grades, XP, assignments' })
  getStudentDashboard(@CurrentUser() user: any, @SchoolId() schoolId: string) {
    return this.dashboardService.getStudentDashboard(user._id, schoolId)
  }

  @Get('teacher')
  @Roles(UserRole.TEACHER, UserRole.CLASS_TEACHER)
  @ApiOperation({ summary: 'Teacher dashboard — classes, pending grading, schedule' })
  getTeacherDashboard(@CurrentUser() user: any, @SchoolId() schoolId: string) {
    return this.dashboardService.getTeacherDashboard(user._id, schoolId)
  }

  @Get('parent')
  @Roles(UserRole.PARENT)
  @ApiOperation({ summary: 'Parent dashboard — children summary, fees, activity' })
  getParentDashboard(@CurrentUser() user: any, @SchoolId() schoolId: string) {
    return this.dashboardService.getParentDashboard(user._id, schoolId)
  }
}

// ─── Module ───────────────────────────────────────────────────────────────────

@Module({
  imports: [],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
