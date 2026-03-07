import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ══════════════════════════════════════════════
//  PAYROLL
// ══════════════════════════════════════════════

@Schema({ timestamps: true, collection: 'salary_grades' })
export class SalaryGrade {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ required: true })
  gradeName: string // e.g., Grade 1, Senior Teacher, Principal

  @Prop({ required: true })
  level: number

  @Prop({ required: true, default: 0 })
  basicSalary: number

  @Prop({ default: 0 })
  housingAllowance: number

  @Prop({ default: 0 })
  transportAllowance: number

  @Prop({ default: 0 })
  medicalAllowance: number

  @Prop({ default: 0 })
  leavAllowance: number

  @Prop({ default: 0 })
  utilitiesAllowance: number

  @Prop({ default: 0 })
  otherAllowances: number

  @Prop({ type: [String], default: [] })
  applicableRoles: string[]

  @Prop({ default: true })
  isActive: boolean
}

export const SalaryGradeSchema = SchemaFactory.createForClass(SalaryGrade)

@Schema({ timestamps: true, collection: 'payroll_records' })
export class PayrollRecord {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId

  @Prop({ required: true })
  month: number

  @Prop({ required: true })
  year: number

  // Earnings
  @Prop({ required: true, default: 0 })
  basicSalary: number

  @Prop({ default: 0 })
  housingAllowance: number

  @Prop({ default: 0 })
  transportAllowance: number

  @Prop({ default: 0 })
  medicalAllowance: number

  @Prop({ default: 0 })
  leaveAllowance: number

  @Prop({ default: 0 })
  overtimePay: number

  @Prop({ type: [{ name: String, amount: Number }], default: [] })
  otherAllowances: { name: string; amount: number }[]

  @Prop({ required: true, default: 0 })
  grossPay: number

  // Deductions
  @Prop({ default: 0 })
  incomeTax: number

  @Prop({ default: 0 })
  pensionEmployee: number // e.g., 8% of basic

  @Prop({ default: 0 })
  pensionEmployer: number // e.g., 10% of basic

  @Prop({ default: 0 })
  nhf: number // National Housing Fund

  @Prop({ default: 0 })
  nhis: number // National Health Insurance

  @Prop({ default: 0 })
  leaveDeduction: number // Unpaid leave deductions

  @Prop({ default: 0 })
  loanDeduction: number

  @Prop({ default: 0 })
  lateDeduction: number

  @Prop({ type: [{ name: String, amount: Number }], default: [] })
  otherDeductions: { name: string; amount: number }[]

  @Prop({ required: true, default: 0 })
  totalDeductions: number

  @Prop({ required: true, default: 0 })
  netPay: number

  // Attendance summary
  @Prop({ default: 0 })
  workingDays: number

  @Prop({ default: 0 })
  presentDays: number

  @Prop({ default: 0 })
  absentDays: number

  @Prop({ default: 0 })
  leavesDays: number

  @Prop({ default: 0 })
  lateDays: number

  @Prop({ default: 0 })
  overtimeHours: number

  // Substitute pay
  @Prop({ default: 0 })
  substituteTeachingPay: number

  // Status
  @Prop({ enum: ['DRAFT', 'APPROVED', 'PAID', 'REVERSED'], default: 'DRAFT' })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedById?: Types.ObjectId

  @Prop()
  approvalDate?: Date

  @Prop()
  paymentDate?: Date

  @Prop()
  paymentReference?: string

  @Prop()
  paymentMethod?: string

  @Prop()
  bankName?: string

  @Prop()
  accountNumber?: string

  @Prop()
  payslipUrl?: string
}

export const PayrollRecordSchema = SchemaFactory.createForClass(PayrollRecord)
PayrollRecordSchema.index({ schoolId: 1, month: 1, year: 1, status: 1 })
PayrollRecordSchema.index({ userId: 1, year: 1, month: 1 }, { unique: true })

@Schema({ timestamps: true, collection: 'staff_loans' })
export class StaffLoan {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({ required: true })
  amount: number

  @Prop({ required: true })
  purpose: string

  @Prop({ required: true })
  monthlyDeduction: number

  @Prop({ required: true })
  totalMonths: number

  @Prop({ default: 0 })
  amountRepaid: number

  @Prop({ enum: ['PENDING', 'APPROVED', 'ACTIVE', 'COMPLETED', 'REJECTED'], default: 'PENDING' })
  status: string

  @Prop()
  startMonth?: number

  @Prop()
  startYear?: number

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedById?: Types.ObjectId
}

export const StaffLoanSchema = SchemaFactory.createForClass(StaffLoan)

// ══════════════════════════════════════════════
//  GAMIFICATION
// ══════════════════════════════════════════════

export enum PointCategory {
  ACADEMIC = 'ACADEMIC',
  ATTENDANCE = 'ATTENDANCE',
  BEHAVIOR = 'BEHAVIOR',
  SPORTS = 'SPORTS',
  SOCIAL = 'SOCIAL',
  SPECIAL = 'SPECIAL',
}

@Schema({ timestamps: true, collection: 'gamification_configs' })
export class GamificationConfig {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, unique: true })
  schoolId: Types.ObjectId

  @Prop({
    type: [
      {
        action: { type: String, required: true },
        category: { type: String, enum: Object.values(PointCategory), required: true },
        points: { type: Number, required: true },
        description: String,
        maxPerDay: Number,
        maxPerTerm: Number,
      },
    ],
    default: [],
  })
  pointRules: {
    action: string
    category: PointCategory
    points: number
    description?: string
    maxPerDay?: number
    maxPerTerm?: number
  }[]

  @Prop({
    type: [
      {
        name: String,
        description: String,
        iconUrl: String,
        category: String,
        pointsRequired: Number,
        condition: String,
      },
    ],
    default: [],
  })
  badges: {
    name: string
    description: string
    iconUrl?: string
    category: string
    pointsRequired?: number
    condition?: string
  }[]

  @Prop({
    type: [
      {
        name: String,
        description: String,
        type: { type: String, enum: ['VIRTUAL', 'PHYSICAL', 'EXPERIENCE', 'PRIVILEGE'] },
        pointsCost: Number,
        stock: Number,
        imageUrl: String,
        isActive: Boolean,
      },
    ],
    default: [],
  })
  rewardStore: {
    name: string
    description: string
    type: string
    pointsCost: number
    stock?: number
    imageUrl?: string
    isActive: boolean
  }[]

  @Prop({ default: true })
  isEnabled: boolean
}

export const GamificationConfigSchema = SchemaFactory.createForClass(GamificationConfig)

@Schema({ timestamps: true, collection: 'student_points' })
export class StudentPoints {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ default: 0 })
  totalPoints: number

  @Prop({ default: 0 })
  availablePoints: number

  @Prop({ default: 0 })
  redeemedPoints: number

  @Prop({ default: 0 })
  termPoints: number

  @Prop({ default: 0 })
  housePoints: number // contribution to house

  @Prop({ type: [{ name: String, iconUrl: String, earnedAt: Date, category: String }], default: [] })
  badges: { name: string; iconUrl?: string; earnedAt: Date; category: string }[]

  @Prop({ default: 1 })
  currentRank: number

  @Prop()
  lastUpdated: Date
}

export const StudentPointsSchema = SchemaFactory.createForClass(StudentPoints)

@Schema({ timestamps: true, collection: 'points_transactions' })
export class PointsTransaction {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ required: true })
  points: number

  @Prop({ enum: ['EARN', 'REDEEM', 'DEDUCT', 'EXPIRE'] })
  type: string

  @Prop({ required: true })
  action: string

  @Prop({ required: true, enum: Object.values(PointCategory) })
  category: PointCategory

  @Prop()
  description?: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  awardedById?: Types.ObjectId

  @Prop()
  referenceId?: string

  @Prop()
  balanceAfter: number
}

export const PointsTransactionSchema = SchemaFactory.createForClass(PointsTransaction)
