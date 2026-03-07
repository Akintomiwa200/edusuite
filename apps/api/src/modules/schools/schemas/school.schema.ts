import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type SchoolDocument = School & Document
export type BranchDocument = Branch & Document

export enum SubscriptionTier {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  ULTIMATE = 'ultimate',
}

export enum SchoolType {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TERTIARY = 'tertiary',
  VOCATIONAL = 'vocational',
  INTERNATIONAL = 'international',
  NURSERY = 'nursery',
  COMBINED = 'combined',
}

@Schema({ timestamps: true, collection: 'schools' })
export class School {
  @Prop({ required: true, trim: true, index: true })
  name: string

  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  code: string // Unique school code e.g. EDU001

  @Prop({ enum: Object.values(SchoolType), default: SchoolType.SECONDARY })
  type: SchoolType

  @Prop({ trim: true })
  motto?: string

  @Prop()
  logo?: string

  @Prop()
  cloudinaryLogoId?: string

  @Prop({ trim: true })
  address: string

  @Prop({ trim: true })
  city: string

  @Prop({ trim: true })
  state: string

  @Prop({ default: 'Nigeria' })
  country: string

  @Prop({ trim: true })
  phone: string

  @Prop({ trim: true, lowercase: true })
  email: string

  @Prop({ trim: true })
  website?: string

  @Prop({ trim: true })
  rcNumber?: string // Company registration number

  @Prop({
    type: {
      tier: { type: String, enum: Object.values(SubscriptionTier), default: SubscriptionTier.BASIC },
      startDate: Date,
      endDate: Date,
      isActive: { type: Boolean, default: true },
      isTrial: { type: Boolean, default: true },
      trialEndsAt: Date,
      maxStudents: { type: Number, default: 500 },
      maxStaff: { type: Number, default: 50 },
      maxBranches: { type: Number, default: 1 },
      features: { type: [String], default: [] },
      monthlyFee: { type: Number, default: 50000 },
      currency: { type: String, default: 'NGN' },
    },
    _id: false,
  })
  subscription: {
    tier: SubscriptionTier
    startDate: Date
    endDate: Date
    isActive: boolean
    isTrial: boolean
    trialEndsAt: Date
    maxStudents: number
    maxStaff: number
    maxBranches: number
    features: string[]
    monthlyFee: number
    currency: string
  }

  @Prop({
    type: {
      currentTermName: String,
      currentTermNumber: { type: Number, enum: [1, 2, 3], default: 1 },
      academicYear: String,
      termStartDate: Date,
      termEndDate: Date,
    },
    _id: false,
  })
  currentTerm?: {
    currentTermName: string
    currentTermNumber: 1 | 2 | 3
    academicYear: string
    termStartDate: Date
    termEndDate: Date
  }

  @Prop({
    type: {
      primaryColor: { type: String, default: '#1E40AF' },
      secondaryColor: { type: String, default: '#F59E0B' },
      accentColor: String,
      darkMode: { type: Boolean, default: false },
      font: String,
    },
    _id: false,
  })
  branding?: {
    primaryColor: string
    secondaryColor: string
    accentColor?: string
    darkMode: boolean
    font?: string
  }

  @Prop({
    type: {
      currency: { type: String, default: 'NGN' },
      currencySymbol: { type: String, default: '₦' },
      timezone: { type: String, default: 'Africa/Lagos' },
      dateFormat: { type: String, default: 'DD/MM/YYYY' },
      gradeSystem: { type: String, enum: ['percentage', 'gpa', 'letter'], default: 'percentage' },
      attendanceModel: { type: String, enum: ['daily', 'period'], default: 'daily' },
      classStartTime: String,
      classEndTime: String,
      weekdays: { type: [Number], default: [1, 2, 3, 4, 5] }, // Mon-Fri
      academicYearStartMonth: { type: Number, default: 9 }, // September
    },
    _id: false,
  })
  settings: {
    currency: string
    currencySymbol: string
    timezone: string
    dateFormat: string
    gradeSystem: 'percentage' | 'gpa' | 'letter'
    attendanceModel: 'daily' | 'period'
    classStartTime?: string
    classEndTime?: string
    weekdays: number[]
    academicYearStartMonth: number
  }

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: Types.ObjectId, ref: 'User' })
  ownerId?: Types.ObjectId // Super admin who registered school

  @Prop({ type: Types.ObjectId, ref: 'User' })
  principalId?: Types.ObjectId
}

export const SchoolSchema = SchemaFactory.createForClass(School)
SchoolSchema.index({ name: 'text', code: 'text' })

// ─── Branch ────────────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'branches' })
export class Branch {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ required: true, trim: true })
  name: string

  @Prop({ trim: true, uppercase: true })
  code: string

  @Prop({ trim: true })
  address: string

  @Prop({ trim: true })
  city: string

  @Prop({ trim: true })
  phone?: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  branchPrincipalId?: Types.ObjectId

  @Prop({ default: true })
  isActive: boolean

  @Prop({ default: false })
  isHeadquarters: boolean
}

export const BranchSchema = SchemaFactory.createForClass(Branch)
BranchSchema.index({ schoolId: 1, code: 1 }, { unique: true })
