import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Enquiry/Prospect ────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'admissions_enquiries' })
export class AdmissionEnquiry {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch' })
  preferredBranchId?: Types.ObjectId

  // Prospect (parent/guardian)
  @Prop({ required: true })
  parentName: string

  @Prop({ required: true })
  parentEmail: string

  @Prop({ required: true })
  parentPhone: string

  // Child info
  @Prop({ required: true })
  childName: string

  @Prop()
  childDateOfBirth?: Date

  @Prop({ enum: ['MALE', 'FEMALE', 'OTHER'] })
  childGender?: string

  @Prop()
  targetAcademicYear?: string

  @Prop()
  targetClass?: string

  @Prop()
  previousSchool?: string

  @Prop()
  howDidYouHear?: string // Referral source

  @Prop({ type: Types.ObjectId, ref: 'User' })
  referredById?: Types.ObjectId

  @Prop()
  message?: string

  @Prop({ enum: ['NEW', 'CONTACTED', 'TOUR_SCHEDULED', 'APPLIED', 'CONVERTED', 'LOST', 'DEFERRED'], default: 'NEW' })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedToId?: Types.ObjectId

  @Prop({
    type: [
      {
        date: Date,
        type: { type: String, enum: ['CALL', 'EMAIL', 'SMS', 'MEETING', 'NOTE'] },
        note: String,
        userId: { type: Types.ObjectId, ref: 'User' },
        outcome: String,
        nextFollowUp: Date,
      },
    ],
    default: [],
  })
  followUps: {
    date: Date
    type: string
    note: string
    userId: Types.ObjectId
    outcome?: string
    nextFollowUp?: Date
  }[]

  @Prop()
  nextFollowUpDate?: Date

  @Prop({ default: false })
  openDayInvited: boolean
}

export const AdmissionEnquirySchema = SchemaFactory.createForClass(AdmissionEnquiry)
AdmissionEnquirySchema.index({ schoolId: 1, status: 1 })
AdmissionEnquirySchema.index({ parentEmail: 1 })

// ─── Application ─────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'admission_applications' })
export class AdmissionApplication {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'AdmissionEnquiry' })
  enquiryId?: Types.ObjectId

  // Application number
  @Prop({ required: true, unique: true })
  applicationNumber: string

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear', required: true })
  academicYearId: Types.ObjectId

  @Prop()
  targetClass: string

  // Applicant
  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop()
  middleName?: string

  @Prop({ required: true })
  dateOfBirth: Date

  @Prop({ required: true, enum: ['MALE', 'FEMALE', 'OTHER'] })
  gender: string

  @Prop()
  nationality?: string

  @Prop()
  religion?: string

  @Prop()
  passportPhotoUrl?: string

  @Prop()
  passportPhotoPublicId?: string

  // Guardian
  @Prop({ required: true })
  guardianName: string

  @Prop({ required: true })
  guardianPhone: string

  @Prop({ required: true })
  guardianEmail: string

  @Prop()
  guardianOccupation?: string

  @Prop()
  guardianAddress?: string

  // Previous school
  @Prop()
  previousSchoolName?: string

  @Prop()
  previousClass?: string

  @Prop()
  leaveReason?: string

  @Prop()
  lastResultUrl?: string

  // Documents
  @Prop({
    type: [
      {
        type: String,
        url: String,
        publicId: String,
        uploadedAt: Date,
        verified: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  documents: { type: string; url: string; publicId: string; uploadedAt: Date; verified: boolean }[]

  // Application fee
  @Prop({ default: false })
  applicationFeePaid: boolean

  @Prop()
  applicationFeeReference?: string

  @Prop({ default: 0 })
  applicationFeeAmount: number

  // Entrance exam
  @Prop()
  entranceExamDate?: Date

  @Prop()
  entranceExamScore?: number

  @Prop()
  entranceExamGrade?: string

  // Interview
  @Prop()
  interviewDate?: Date

  @Prop({ type: Types.ObjectId, ref: 'User' })
  interviewerId?: Types.ObjectId

  @Prop({ default: 0 })
  interviewScore?: number

  @Prop()
  interviewNotes?: string

  // Decision
  @Prop({
    enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'EXAM_SCHEDULED', 'INTERVIEW_SCHEDULED', 'OFFER_MADE', 'WAITLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
    default: 'DRAFT',
    index: true,
  })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedById?: Types.ObjectId

  @Prop()
  decisionDate?: Date

  @Prop()
  decisionNotes?: string

  // Offer
  @Prop()
  offerLetterUrl?: string

  @Prop()
  offerExpiryDate?: Date

  @Prop({ default: false })
  offerAccepted: boolean

  @Prop()
  offerAcceptanceDate?: Date

  // Enrollment
  @Prop({ default: false })
  enrolled: boolean

  @Prop({ type: Types.ObjectId, ref: 'Student' })
  studentId?: Types.ObjectId

  @Prop({ default: false })
  depositPaid: boolean

  @Prop()
  depositReference?: string
}

export const AdmissionApplicationSchema = SchemaFactory.createForClass(AdmissionApplication)
AdmissionApplicationSchema.index({ schoolId: 1, status: 1, academicYearId: 1 })
