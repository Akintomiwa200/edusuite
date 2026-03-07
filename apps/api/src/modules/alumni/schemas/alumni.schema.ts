import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Alumni Profile ──────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'alumni' })
export class Alumni {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId // if they have a portal account

  @Prop({ type: Types.ObjectId, ref: 'Student' })
  studentId?: Types.ObjectId // link to original student record

  @Prop({ required: true })
  firstName: string

  @Prop({ required: true })
  lastName: string

  @Prop({ required: true })
  graduationYear: number

  @Prop()
  admissionNumber?: string

  @Prop()
  finalClass?: string

  @Prop()
  email?: string

  @Prop()
  phone?: string

  @Prop()
  currentAddress?: string

  @Prop()
  country?: string

  @Prop()
  profilePhotoUrl?: string

  // Career
  @Prop()
  currentEmployer?: string

  @Prop()
  jobTitle?: string

  @Prop()
  industry?: string

  @Prop()
  yearsOfExperience?: number

  // Education
  @Prop({
    type: [
      {
        institution: String,
        degree: String,
        field: String,
        graduationYear: Number,
      },
    ],
    default: [],
  })
  higherEducation: { institution: string; degree: string; field: string; graduationYear: number }[]

  // Social
  @Prop()
  linkedinUrl?: string

  @Prop()
  twitterHandle?: string

  @Prop()
  facebookUrl?: string

  @Prop()
  websiteUrl?: string

  // Engagement
  @Prop({ default: false })
  isMentor: boolean

  @Prop({ type: [String], default: [] })
  mentorshipAreas: string[]

  @Prop({ default: true })
  receiveNewsletter: boolean

  @Prop({ default: false })
  profilePublic: boolean

  @Prop({ default: 0 })
  totalDonations: number

  @Prop()
  lastContactDate?: Date

  @Prop()
  bio?: string

  @Prop()
  notableAchievements?: string

  @Prop({ enum: ['ACTIVE', 'INACTIVE', 'DECEASED', 'UNVERIFIED'], default: 'UNVERIFIED' })
  status: string

  @Prop({ default: false })
  portalAccessEnabled: boolean
}

export const AlumniSchema = SchemaFactory.createForClass(Alumni)
AlumniSchema.index({ schoolId: 1, graduationYear: 1 })
AlumniSchema.index({ email: 1 })
AlumniSchema.index({ firstName: 'text', lastName: 'text' })

// ─── Alumni Donation ─────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'alumni_donations' })
export class AlumniDonation {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Alumni', required: true })
  alumniId: Types.ObjectId

  @Prop({ required: true })
  amount: number

  @Prop({ required: true })
  currency: string

  @Prop()
  purpose?: string // scholarship, infrastructure, library, etc.

  @Prop()
  paymentReference?: string

  @Prop()
  paymentMethod?: string

  @Prop({ enum: ['PENDING', 'CONFIRMED', 'FAILED'], default: 'PENDING' })
  status: string

  @Prop({ default: false })
  isAnonymous: boolean

  @Prop()
  message?: string

  @Prop()
  receiptUrl?: string
}

export const AlumniDonationSchema = SchemaFactory.createForClass(AlumniDonation)

// ─── Alumni Event ────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'alumni_events' })
export class AlumniEvent {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop()
  description?: string

  @Prop({ enum: ['REUNION', 'NETWORKING', 'MENTORSHIP', 'FUNDRAISER', 'WEBINAR', 'OTHER'] })
  type: string

  @Prop({ required: true })
  eventDate: Date

  @Prop()
  venue?: string

  @Prop()
  targetGraduationYears?: number[] // specific class reunions

  @Prop({
    type: [{ alumniId: { type: Types.ObjectId, ref: 'Alumni' }, response: String, date: Date }],
    default: [],
  })
  rsvp: { alumniId: Types.ObjectId; response: 'YES' | 'NO' | 'MAYBE'; date: Date }[]

  @Prop({ enum: ['PLANNING', 'PUBLISHED', 'COMPLETED', 'CANCELLED'], default: 'PLANNING' })
  status: string
}

export const AlumniEventSchema = SchemaFactory.createForClass(AlumniEvent)

// ─── Alumni Mentorship Pairing ───────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'mentorship_pairings' })
export class MentorshipPairing {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Alumni', required: true })
  mentorId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  menteeId: Types.ObjectId

  @Prop()
  focusArea?: string

  @Prop({ required: true })
  startDate: Date

  @Prop()
  endDate?: Date

  @Prop({ enum: ['ACTIVE', 'COMPLETED', 'PAUSED', 'TERMINATED'], default: 'ACTIVE' })
  status: string

  @Prop({
    type: [{ date: Date, summary: String, nextMeeting: Date }],
    default: [],
  })
  sessionLogs: { date: Date; summary: string; nextMeeting?: Date }[]
}

export const MentorshipPairingSchema = SchemaFactory.createForClass(MentorshipPairing)
