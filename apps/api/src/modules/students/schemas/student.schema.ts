import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type StudentDocument = Student & Document

export enum StudentStatus {
  ACTIVE = 'active',
  GRADUATED = 'graduated',
  WITHDRAWN = 'withdrawn',
  SUSPENDED = 'suspended',
  EXPELLED = 'expelled',
  TRANSFERRED = 'transferred',
  DECEASED = 'deceased',
}

export enum BloodGroup {
  A_POS = 'A+', A_NEG = 'A-',
  B_POS = 'B+', B_NEG = 'B-',
  AB_POS = 'AB+', AB_NEG = 'AB-',
  O_POS = 'O+', O_NEG = 'O-',
}

export enum Gender { MALE = 'male', FEMALE = 'female', OTHER = 'other' }
export enum Religion { CHRISTIANITY = 'Christianity', ISLAM = 'Islam', OTHER = 'Other' }

@Schema({ timestamps: true, collection: 'students' })
export class Student {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId

  @Prop({ required: true, unique: true, trim: true, uppercase: true, index: true })
  admissionNumber: string

  @Prop({ required: true, trim: true })
  firstName: string

  @Prop({ trim: true })
  middleName?: string

  @Prop({ required: true, trim: true })
  lastName: string

  @Prop({ required: true, enum: Object.values(Gender), index: true })
  gender: Gender

  @Prop({ required: true })
  dateOfBirth: Date

  @Prop({ enum: Object.values(BloodGroup) })
  bloodGroup?: BloodGroup

  @Prop({ enum: Object.values(Religion) })
  religion?: Religion

  @Prop({ trim: true })
  nationality?: string

  @Prop({ trim: true })
  stateOfOrigin?: string

  @Prop({ trim: true })
  address?: string

  @Prop({ trim: true })
  profilePicture?: string

  @Prop()
  cloudinaryPublicId?: string

  // ─── Academic Info ────────────────────────────────────────────────────────

  @Prop({ type: Types.ObjectId, ref: 'ClassRoom', index: true })
  classId?: Types.ObjectId // current class

  @Prop({ type: Types.ObjectId, ref: 'ClassRoom' })
  previousClassId?: Types.ObjectId

  @Prop({ trim: true })
  currentClass?: string // e.g. "JSS 1A"

  @Prop({ trim: true })
  house?: string // school house for sports

  @Prop({ required: true })
  admissionDate: Date

  @Prop()
  graduationDate?: Date

  @Prop({ enum: Object.values(StudentStatus), default: StudentStatus.ACTIVE, index: true })
  status: StudentStatus

  // ─── Parents/Guardians ────────────────────────────────────────────────────

  @Prop({
    type: [{
      userId: { type: Types.ObjectId, ref: 'User' },
      firstName: String,
      lastName: String,
      relationship: { type: String, enum: ['father', 'mother', 'guardian', 'uncle', 'aunt', 'grandparent', 'sibling', 'other'] },
      phone: String,
      email: String,
      address: String,
      occupation: String,
      isPrimary: { type: Boolean, default: false },
      canPickup: { type: Boolean, default: true },
      emergencyContact: { type: Boolean, default: false },
    }],
  })
  parents: Array<{
    userId?: Types.ObjectId
    firstName: string
    lastName: string
    relationship: string
    phone: string
    email?: string
    address?: string
    occupation?: string
    isPrimary: boolean
    canPickup: boolean
    emergencyContact: boolean
  }>

  // ─── Health Info ─────────────────────────────────────────────────────────

  @Prop({
    type: {
      allergies: [String],
      medicalConditions: [String],
      medications: [String],
      specialNeeds: [String],
      doctorName: String,
      doctorPhone: String,
      hospitalName: String,
      insuranceProvider: String,
      insurancePolicyNumber: String,
    },
    _id: false,
  })
  healthInfo?: {
    allergies: string[]
    medicalConditions: string[]
    medications: string[]
    specialNeeds: string[]
    doctorName?: string
    doctorPhone?: string
    hospitalName?: string
    insuranceProvider?: string
    insurancePolicyNumber?: string
  }

  // ─── Financial ────────────────────────────────────────────────────────────

  @Prop({ default: 0 })
  feeBalance: number // Outstanding balance (positive = owes, negative = credit)

  @Prop({ default: false })
  onScholarship: boolean

  @Prop({ trim: true })
  scholarshipType?: string

  @Prop({ default: 0, min: 0, max: 100 })
  scholarshipPercentage: number

  // ─── Hostel ───────────────────────────────────────────────────────────────

  @Prop({ default: false })
  isBoarding: boolean

  @Prop({ type: Types.ObjectId, ref: 'HostelRoom' })
  hostelRoomId?: Types.ObjectId

  // ─── Gamification ─────────────────────────────────────────────────────────

  @Prop({ default: 0 })
  totalXp: number

  @Prop({ default: 1 })
  level: number

  @Prop({ default: 0 })
  loginStreak: number

  @Prop()
  lastLoginDate?: Date

  // ─── Social ───────────────────────────────────────────────────────────────

  @Prop({
    type: {
      bio: String,
      interests: [String],
      isProfilePublic: { type: Boolean, default: true },
      allowFriendRequests: { type: Boolean, default: true },
      allowMessages: { type: Boolean, default: true },
    },
    _id: false,
  })
  socialProfile?: {
    bio?: string
    interests: string[]
    isProfilePublic: boolean
    allowFriendRequests: boolean
    allowMessages: boolean
  }

  // ─── Documents ───────────────────────────────────────────────────────────

  @Prop({
    type: [{
      name: String,
      url: String,
      cloudinaryId: String,
      uploadedAt: { type: Date, default: Date.now },
    }],
  })
  documents: Array<{ name: string; url: string; cloudinaryId?: string; uploadedAt: Date }>

  @Prop({ type: Map, of: String, default: {} })
  customFields: Map<string, string>

  @Prop({ trim: true })
  notes?: string
}

export const StudentSchema = SchemaFactory.createForClass(Student)

StudentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true })
StudentSchema.index({ schoolId: 1, status: 1 })
StudentSchema.index({ schoolId: 1, classId: 1 })
StudentSchema.index({ firstName: 'text', lastName: 'text', admissionNumber: 'text' })

// Virtual for full name
StudentSchema.virtual('fullName').get(function (this: Student) {
  return [this.firstName, this.middleName, this.lastName].filter(Boolean).join(' ')
})

StudentSchema.set('toJSON', { virtuals: true })
StudentSchema.set('toObject', { virtuals: true })
