import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type TeacherDocument = Teacher & Document

export enum TeacherStatus {
  ACTIVE = 'active',
  ON_LEAVE = 'on_leave',
  SUSPENDED = 'suspended',
  RESIGNED = 'resigned',
  TERMINATED = 'terminated',
  RETIRED = 'retired',
}

export enum QualificationLevel {
  OND = 'OND',
  HND = 'HND',
  BSC = 'BSc',
  BED = 'BEd',
  PGDE = 'PGDE',
  MSC = 'MSc',
  MED = 'MEd',
  PHD = 'PhD',
  OTHER = 'Other',
}

export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  VISITING = 'visiting',
  INTERN = 'intern',
}

@Schema({ timestamps: true, collection: 'teachers' })
export class Teacher {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId

  @Prop({ required: true, unique: true, trim: true, uppercase: true, index: true })
  staffId: string

  @Prop({ required: true, trim: true })
  firstName: string

  @Prop({ trim: true })
  middleName?: string

  @Prop({ required: true, trim: true })
  lastName: string

  @Prop({ required: true })
  dateOfBirth: Date

  @Prop({ required: true, enum: ['male', 'female', 'other'] })
  gender: string

  @Prop({ required: true })
  phone: string

  @Prop({ required: true, lowercase: true, trim: true })
  email: string

  @Prop()
  address?: string

  @Prop()
  stateOfOrigin?: string

  @Prop()
  nationality?: string

  @Prop()
  profilePhoto?: string

  @Prop({ enum: Object.values(EmploymentType), default: EmploymentType.FULL_TIME })
  employmentType: EmploymentType

  @Prop({ required: true })
  dateOfEmployment: Date

  @Prop()
  dateOfConfirmation?: Date

  @Prop({ type: Types.ObjectId, ref: 'SalaryGrade' })
  salaryGradeId?: Types.ObjectId

  @Prop({ default: 1 })
  gradeStep: number

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Subject' }], default: [] })
  subjects: Types.ObjectId[]

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Class' }], default: [] })
  classes: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'Class' })
  formClass?: Types.ObjectId // Class teacher assignment

  @Prop({ type: [Types.ObjectId], ref: 'Department', default: [] })
  departments: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'Department' })
  headOfDepartment?: Types.ObjectId

  @Prop({
    type: [{
      level: { type: String, enum: Object.values(QualificationLevel) },
      institution: String,
      course: String,
      yearObtained: Number,
      grade: String,
      certificate: String,
    }],
    default: [],
  })
  qualifications: {
    level: QualificationLevel
    institution: string
    course: string
    yearObtained: number
    grade?: string
    certificate?: string
  }[]

  @Prop({
    type: [{
      name: String,
      issuer: String,
      dateObtained: Date,
      expiryDate: Date,
      certificateUrl: String,
    }],
    default: [],
  })
  certifications: {
    name: string
    issuer: string
    dateObtained: Date
    expiryDate?: Date
    certificateUrl?: string
  }[]

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Document' }], default: [] })
  documents: Types.ObjectId[]

  @Prop({ type: { name: String, phone: String, relationship: String, address: String } })
  nextOfKin?: {
    name: string
    phone: string
    relationship: string
    address?: string
  }

  @Prop({ type: { bank: String, accountNumber: String, accountName: String, sortCode: String } })
  bankDetails?: {
    bank: string
    accountNumber: string
    accountName: string
    sortCode?: string
  }

  @Prop({ default: 0 })
  cpdPoints: number

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Training' }], default: [] })
  trainingHistory: Types.ObjectId[]

  @Prop({ type: Object, default: {} })
  performanceRatings: Record<string, number>

  @Prop({ default: 0 })
  averageRating: number

  @Prop({ enum: Object.values(TeacherStatus), default: TeacherStatus.ACTIVE, index: true })
  status: TeacherStatus

  @Prop({ type: Object })
  metadata?: Record<string, unknown>
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher)

TeacherSchema.index({ schoolId: 1, status: 1 })
TeacherSchema.index({ schoolId: 1, userId: 1 }, { unique: true })
TeacherSchema.index({ schoolId: 1, subjects: 1 })
TeacherSchema.index({ schoolId: 1, formClass: 1 })
