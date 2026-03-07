import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ══════════════════════════════════════════════
//  AUDIT LOGS
// ══════════════════════════════════════════════

@Schema({ collection: 'audit_logs' })
export class AuditLog {
  @Prop({ type: Types.ObjectId, ref: 'School', index: true })
  schoolId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId

  @Prop()
  userEmail?: string

  @Prop()
  userRole?: string

  @Prop({ required: true, index: true })
  action: string // e.g., 'USER.CREATE', 'FEE.PAYMENT', 'EXAM.RESULT_EDIT'

  @Prop({ required: true })
  module: string // e.g., 'USERS', 'FINANCE', 'EXAMS'

  @Prop()
  resourceType?: string // e.g., 'Student', 'FeePayment'

  @Prop()
  resourceId?: string

  @Prop({ type: Object })
  previousValue?: Record<string, any>

  @Prop({ type: Object })
  newValue?: Record<string, any>

  @Prop({ type: Object })
  metadata?: Record<string, any>

  @Prop({ required: true })
  ipAddress: string

  @Prop()
  userAgent?: string

  @Prop({ required: true, default: Date.now, index: true })
  timestamp: Date

  @Prop({ enum: ['SUCCESS', 'FAILURE', 'WARNING'], default: 'SUCCESS' })
  result: string

  @Prop()
  errorMessage?: string
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog)
AuditLogSchema.index({ schoolId: 1, timestamp: -1 })
AuditLogSchema.index({ userId: 1, timestamp: -1 })
AuditLogSchema.index({ action: 1, module: 1, timestamp: -1 })
// TTL index: auto-delete logs older than 2 years (63072000 seconds)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 63072000 })

// ══════════════════════════════════════════════
//  COMMUNICATION CENTER
// ══════════════════════════════════════════════

// ─── Notice Board Post ───────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'notice_board' })
export class NoticeBoard {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: [Types.ObjectId], ref: 'Branch', default: [] })
  branchIds: Types.ObjectId[]

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  content: string

  @Prop({ enum: ['ANNOUNCEMENT', 'CLASSIFIEDS', 'LOST_AND_FOUND', 'NOTICE', 'URGENT'], required: true })
  type: string

  @Prop({ type: [String], default: [] })
  targetAudience: string[] // STUDENTS, TEACHERS, PARENTS, STAFF, ALL

  @Prop({ type: [Types.ObjectId], ref: 'Class', default: [] })
  targetClassIds: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  postedById: Types.ObjectId

  @Prop()
  expiryDate?: Date

  @Prop({ type: [String], default: [] })
  attachmentUrls: string[]

  @Prop({ default: false })
  isPinned: boolean

  @Prop({ default: true })
  isActive: boolean

  @Prop({ default: 0 })
  viewCount: number
}

export const NoticeBoardSchema = SchemaFactory.createForClass(NoticeBoard)
NoticeBoardSchema.index({ schoolId: 1, type: 1, isActive: 1, expiryDate: 1 })

// ─── Bulk Messaging ──────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'bulk_messages' })
export class BulkMessage {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ required: true })
  subject: string

  @Prop({ required: true })
  body: string

  @Prop({ required: true, enum: ['SMS', 'EMAIL', 'PUSH', 'IN_APP'] })
  channel: string

  @Prop({ required: true, enum: ['ALL_PARENTS', 'ALL_STAFF', 'ALL_TEACHERS', 'ALL_STUDENTS', 'CLASS', 'INDIVIDUAL', 'CUSTOM_LIST'] })
  targetGroup: string

  @Prop({ type: [Types.ObjectId], ref: 'Class', default: [] })
  targetClassIds: Types.ObjectId[]

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  targetUserIds: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sentById: Types.ObjectId

  @Prop()
  scheduledAt?: Date

  @Prop({ enum: ['DRAFT', 'SCHEDULED', 'SENDING', 'SENT', 'FAILED'], default: 'DRAFT' })
  status: string

  @Prop({ default: 0 })
  totalRecipients: number

  @Prop({ default: 0 })
  successCount: number

  @Prop({ default: 0 })
  failCount: number

  @Prop()
  sentAt?: Date

  @Prop({ type: [String], default: [] })
  attachmentUrls: string[]
}

export const BulkMessageSchema = SchemaFactory.createForClass(BulkMessage)

// ─── Parent-Teacher Meeting ───────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'pt_meetings' })
export class ParentTeacherMeeting {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  parentId: Types.ObjectId

  @Prop({ required: true })
  scheduledAt: Date

  @Prop({ default: 30 })
  durationMinutes: number

  @Prop({ enum: ['IN_PERSON', 'ONLINE'], default: 'IN_PERSON' })
  format: string

  @Prop()
  meetingLink?: string

  @Prop({ enum: ['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'], default: 'REQUESTED' })
  status: string

  @Prop()
  agenda?: string

  @Prop()
  notes?: string

  @Prop()
  followUpActions?: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  requestedById: Types.ObjectId

  @Prop()
  reminderSent: boolean
}

export const ParentTeacherMeetingSchema = SchemaFactory.createForClass(ParentTeacherMeeting)

// ─── Direct Message ──────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'direct_messages' })
export class DirectMessage {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipientId: Types.ObjectId

  @Prop({ required: true })
  message: string

  @Prop({ type: [String], default: [] })
  attachmentUrls: string[]

  @Prop({ default: false })
  read: boolean

  @Prop()
  readAt?: Date

  @Prop({ default: false })
  isDeleted: boolean

  @Prop({ enum: ['NORMAL', 'URGENT', 'INFO'], default: 'NORMAL' })
  priority: string
}

export const DirectMessageSchema = SchemaFactory.createForClass(DirectMessage)
DirectMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 })
