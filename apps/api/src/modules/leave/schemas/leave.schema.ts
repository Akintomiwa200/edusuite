import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type LeaveRequestDocument = LeaveRequest & Document
export type LeaveBalanceDocument = LeaveBalance & Document
export type SubstituteAssignmentDocument = SubstituteAssignment & Document

export enum LeaveType {
  ANNUAL = 'ANNUAL',
  SICK = 'SICK',
  EMERGENCY_SICK = 'EMERGENCY_SICK',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  BEREAVEMENT = 'BEREAVEMENT',
  STUDY = 'STUDY',
  EXAMINATION = 'EXAMINATION',
  UNPAID = 'UNPAID',
  SABBATICAL = 'SABBATICAL',
  CASUAL = 'CASUAL',
  HALF_DAY = 'HALF_DAY',
  LATE_ARRIVAL = 'LATE_ARRIVAL',
  RELIGIOUS = 'RELIGIOUS',
  WEDDING = 'WEDDING',
  CHILDCARE = 'CHILDCARE',
  HOSPITALIZATION = 'HOSPITALIZATION',
  QUARANTINE = 'QUARANTINE',
  JURY_DUTY = 'JURY_DUTY',
}

export enum LeaveStatus {
  PENDING = 'PENDING',
  PENDING_SUPERVISOR = 'PENDING_SUPERVISOR',
  PENDING_ACADEMIC_HEAD = 'PENDING_ACADEMIC_HEAD',
  PENDING_HR = 'PENDING_HR',
  PENDING_BRANCH_ADMIN = 'PENDING_BRANCH_ADMIN',
  PENDING_CENTRAL_ADMIN = 'PENDING_CENTRAL_ADMIN',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  RECALLED = 'RECALLED',
  TAKEN = 'TAKEN',
}

export enum LeaveHalfDayPart {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
}

@Schema({ timestamps: true, collection: 'leave_requests' })
export class LeaveRequest {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true, index: true })
  branchId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId

  @Prop({ required: true, enum: Object.values(LeaveType) })
  leaveType: LeaveType

  @Prop({ required: true })
  startDate: Date

  @Prop({ required: true })
  endDate: Date

  @Prop({ required: true, min: 0.5 })
  durationDays: number

  @Prop({ enum: Object.values(LeaveHalfDayPart) })
  halfDayPart?: LeaveHalfDayPart

  @Prop({ required: true })
  reason: string

  @Prop()
  documentUrl?: string

  @Prop()
  documentPublicId?: string

  @Prop({ type: [String], default: [] })
  additionalDocumentUrls: string[]

  // Handover
  @Prop()
  handoverNotes?: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  substituteTeacherId?: Types.ObjectId

  @Prop({ default: false })
  substituteConfirmed: boolean

  // Approval chain
  @Prop({
    required: true,
    enum: Object.values(LeaveStatus),
    default: LeaveStatus.PENDING,
    index: true,
  })
  status: LeaveStatus

  @Prop({
    type: [
      {
        level: String,
        approverId: { type: Types.ObjectId, ref: 'User' },
        action: { type: String, enum: ['APPROVED', 'REJECTED', 'NOTED'] },
        comment: String,
        date: Date,
      },
    ],
    default: [],
  })
  approvalHistory: {
    level: string
    approverId: Types.ObjectId
    action: string
    comment?: string
    date: Date
  }[]

  @Prop({ type: Types.ObjectId, ref: 'User' })
  finalApprovedById?: Types.ObjectId

  @Prop()
  finalApprovalDate?: Date

  @Prop()
  rejectionReason?: string

  // Conflicts
  @Prop({ default: false })
  hasConflict: boolean

  @Prop({ type: [String], default: [] })
  conflictDetails: string[]

  // Recall (admin can recall approved leave)
  @Prop({ type: Types.ObjectId, ref: 'User' })
  recalledById?: Types.ObjectId

  @Prop()
  recallReason?: string

  @Prop()
  recallDate?: Date

  // Payroll impact
  @Prop({ default: false })
  payrollAdjusted: boolean

  @Prop({ default: 0 })
  payDeductionDays: number
}

export const LeaveRequestSchema = SchemaFactory.createForClass(LeaveRequest)
LeaveRequestSchema.index({ schoolId: 1, status: 1, startDate: 1 })
LeaveRequestSchema.index({ userId: 1, leaveType: 1, status: 1 })
LeaveRequestSchema.index({ startDate: 1, endDate: 1, branchId: 1 })

// ─── Leave Balance ───────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'leave_balances' })
export class LeaveBalance {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({ required: true, enum: Object.values(LeaveType) })
  leaveType: LeaveType

  @Prop({ required: true })
  year: number

  @Prop({ required: true, default: 0 })
  totalDays: number

  @Prop({ default: 0 })
  usedDays: number

  @Prop({ default: 0 })
  pendingDays: number

  @Prop({ default: 0 })
  carriedOverDays: number

  @Prop({ default: 0 })
  encashedDays: number

  // Accrual tracking (for annual/sick leave)
  @Prop({
    type: [
      {
        month: Number,
        year: Number,
        accrued: Number,
        date: Date,
      },
    ],
    default: [],
  })
  accrualHistory: { month: number; year: number; accrued: number; date: Date }[]
}

export const LeaveBalanceSchema = SchemaFactory.createForClass(LeaveBalance)
LeaveBalanceSchema.index({ userId: 1, leaveType: 1, year: 1 }, { unique: true })

// ─── Substitute Assignment ───────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'substitute_assignments' })
export class SubstituteAssignment {
  @Prop({ type: Types.ObjectId, ref: 'LeaveRequest', required: true })
  leaveRequestId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  originalTeacherId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  substituteTeacherId: Types.ObjectId

  @Prop({ required: true })
  startDate: Date

  @Prop({ required: true })
  endDate: Date

  @Prop({ type: [Types.ObjectId], ref: 'Class', default: [] })
  classIds: Types.ObjectId[]

  @Prop({ type: [Types.ObjectId], ref: 'Subject', default: [] })
  subjectIds: Types.ObjectId[]

  @Prop({ enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'], default: 'PENDING' })
  status: string

  @Prop()
  substituteResponse?: string

  @Prop({ type: Number, default: 0 })
  dailyRate: number

  @Prop({ type: Number, default: 0 })
  totalPayment: number

  @Prop({ default: false })
  paymentProcessed: boolean
}

export const SubstituteAssignmentSchema = SchemaFactory.createForClass(SubstituteAssignment)

// ─── Leave Policy ────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'leave_policies' })
export class LeavePolicy {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ required: true, enum: Object.values(LeaveType) })
  leaveType: LeaveType

  @Prop({ required: true })
  name: string

  @Prop({ required: true, default: 0 })
  defaultDays: number

  @Prop({ default: true })
  isPaid: boolean

  @Prop({ default: 0, min: 0, max: 100 })
  payPercentage: number // 100=full pay, 60=60% pay

  @Prop({ type: [String], default: [] })
  applicableRoles: string[]

  @Prop({ default: true })
  requiresDocument: boolean

  @Prop({ default: 2 })
  documentRequiredAfterDays: number

  @Prop({ default: true })
  accrues: boolean

  @Prop({ default: 0 })
  accrualRatePerMonth: number

  @Prop({ default: 0 })
  maxCarryOverDays: number

  @Prop({ default: false })
  allowEncashment: boolean

  @Prop({ type: [String], default: [] })
  blackoutPeriods: string[] // ISO date ranges

  @Prop({ default: 0 })
  minStaffingPercent: number // min staff required before blocking leave

  @Prop({
    type: [String],
    enum: [
      'SUPERVISOR',
      'ACADEMIC_HEAD',
      'HR',
      'BRANCH_ADMIN',
      'CENTRAL_ADMIN',
    ],
    default: ['HR', 'BRANCH_ADMIN'],
  })
  approvalLevels: string[]

  @Prop({ default: true })
  isActive: boolean
}

export const LeavePolicySchema = SchemaFactory.createForClass(LeavePolicy)
