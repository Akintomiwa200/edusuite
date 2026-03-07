import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ══════════════════════════════════════════════
//  ICT SUPPORT
// ══════════════════════════════════════════════

// ─── ICT Asset ───────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'ict_assets' })
export class IctAsset {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true, unique: true })
  assetTag: string

  @Prop({ required: true })
  name: string

  @Prop({ enum: ['DESKTOP', 'LAPTOP', 'TABLET', 'PRINTER', 'PROJECTOR', 'SERVER', 'NETWORK_DEVICE', 'MONITOR', 'PHONE', 'OTHER'], required: true })
  type: string

  @Prop()
  make?: string

  @Prop()
  model?: string

  @Prop()
  serialNumber?: string

  @Prop()
  purchaseDate?: Date

  @Prop({ default: 0 })
  purchaseCost: number

  @Prop()
  warrantyExpiry?: Date

  @Prop()
  warrantyDocUrl?: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedToId?: Types.ObjectId

  @Prop()
  location?: string

  @Prop({ enum: ['ACTIVE', 'IN_REPAIR', 'DECOMMISSIONED', 'STOLEN', 'LOST'], default: 'ACTIVE' })
  status: string

  @Prop()
  operatingSystem?: string

  @Prop()
  processorSpec?: string

  @Prop()
  ramGB?: number

  @Prop()
  storageGB?: number

  @Prop()
  ipAddress?: string

  @Prop()
  macAddress?: string

  @Prop({ type: [{ name: String, version: String, licenseKey: String, expiryDate: Date }], default: [] })
  installedSoftware: { name: string; version?: string; licenseKey?: string; expiryDate?: Date }[]

  @Prop()
  imageUrl?: string
}

export const IctAssetSchema = SchemaFactory.createForClass(IctAsset)
IctAssetSchema.index({ schoolId: 1, type: 1, status: 1 })

// ─── IT Support Ticket ───────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'it_tickets' })
export class ItTicket {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ required: true, unique: true })
  ticketNumber: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedById: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  description: string

  @Prop({ enum: ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'EMAIL', 'PRINTING', 'ACCOUNT', 'OTHER'], required: true })
  category: string

  @Prop({ enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], required: true })
  priority: string

  @Prop({ type: Types.ObjectId, ref: 'IctAsset' })
  affectedAssetId?: Types.ObjectId

  @Prop({ enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'PENDING_USER', 'RESOLVED', 'CLOSED', 'ESCALATED'], default: 'OPEN' })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedToId?: Types.ObjectId

  @Prop()
  resolutionNotes?: string

  @Prop()
  resolvedAt?: Date

  @Prop({ default: false })
  remoteSupport: boolean

  @Prop({ type: [{ date: Date, message: String, userId: Types.ObjectId, isPublic: Boolean }], default: [] })
  comments: { date: Date; message: string; userId: Types.ObjectId; isPublic: boolean }[]

  @Prop({ type: [String], default: [] })
  screenshotUrls: string[]

  @Prop({ min: 1, max: 5 })
  satisfactionRating?: number

  @Prop()
  satisfactionComment?: string

  // Knowledge base
  @Prop()
  knowledgeBaseArticleId?: string

  @Prop()
  slaDeadline?: Date

  @Prop({ default: false })
  slaBreach: boolean
}

export const ItTicketSchema = SchemaFactory.createForClass(ItTicket)
ItTicketSchema.index({ schoolId: 1, status: 1, priority: 1 })

// ══════════════════════════════════════════════
//  SECURITY MANAGEMENT
// ══════════════════════════════════════════════

// ─── Visitor Log ─────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'visitor_logs' })
export class VisitorLog {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  visitorName: string

  @Prop({ required: true })
  visitorPhone: string

  @Prop()
  visitorEmail?: string

  @Prop({ enum: ['NIN', 'DRIVERS_LICENSE', 'INTERNATIONAL_PASSPORT', 'VOTER_CARD', 'OTHER'] })
  idType?: string

  @Prop()
  idNumber?: string

  @Prop()
  idImageUrl?: string

  @Prop()
  visitorPhotoUrl?: string

  @Prop({ required: true })
  purpose: string

  @Prop()
  personToVisitName?: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  personToVisitId?: Types.ObjectId

  @Prop({ required: true })
  checkInTime: Date

  @Prop()
  checkOutTime?: Date

  @Prop({ required: true })
  date: Date

  @Prop({ enum: ['PENDING', 'APPROVED', 'DENIED', 'CHECKED_OUT'], default: 'PENDING' })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  loggedById: Types.ObjectId

  @Prop()
  badgeNumber?: string

  @Prop({ default: false })
  hostNotified: boolean

  @Prop()
  vehiclePlate?: string

  @Prop()
  notes?: string
}

export const VisitorLogSchema = SchemaFactory.createForClass(VisitorLog)
VisitorLogSchema.index({ schoolId: 1, date: -1 })
VisitorLogSchema.index({ visitorName: 'text', visitorPhone: 1 })

// ─── Security Incident ───────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'security_incidents' })
export class SecurityIncident {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true, unique: true })
  incidentNumber: string

  @Prop({ required: true })
  incidentDate: Date

  @Prop({ required: true })
  incidentTime: string

  @Prop({ required: true })
  location: string

  @Prop({ enum: ['THEFT', 'FIGHT', 'ACCIDENT', 'TRESPASSING', 'VANDALISM', 'FIRE', 'MEDICAL_EMERGENCY', 'KIDNAPPING_ATTEMPT', 'CYBER_INCIDENT', 'OTHER'], required: true })
  type: string

  @Prop({ required: true })
  description: string

  @Prop({ type: [String], default: [] })
  involvedPersons: string[]

  @Prop()
  witnessName?: string

  @Prop()
  witnessStatement?: string

  @Prop({ enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], required: true })
  severity: string

  @Prop()
  actionTaken: string

  @Prop({ default: false })
  policeReported: boolean

  @Prop()
  policeReportNumber?: string

  @Prop({ default: false })
  parentNotified: boolean

  @Prop({ type: [String], default: [] })
  evidenceUrls: string[]

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedById: Types.ObjectId

  @Prop({ enum: ['OPEN', 'INVESTIGATING', 'RESOLVED', 'CLOSED'], default: 'OPEN' })
  status: string

  @Prop()
  resolutionNotes?: string

  @Prop()
  cctv_footage_available: boolean
}

export const SecurityIncidentSchema = SchemaFactory.createForClass(SecurityIncident)

// ─── Gate Entry/Exit Log ─────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'gate_logs' })
export class GateLog {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User' })
  userId?: Types.ObjectId

  @Prop()
  personName?: string

  @Prop({ enum: ['STUDENT', 'STAFF', 'VISITOR', 'VEHICLE'] })
  personType: string

  @Prop({ enum: ['IN', 'OUT'], required: true })
  direction: string

  @Prop({ required: true })
  timestamp: Date

  @Prop({ enum: ['MANUAL', 'RFID', 'QR_CODE', 'BIOMETRIC'], default: 'MANUAL' })
  method: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  loggedById?: Types.ObjectId

  @Prop()
  vehiclePlate?: string

  @Prop()
  notes?: string

  @Prop({ default: true })
  isAuthorized: boolean
}

export const GateLogSchema = SchemaFactory.createForClass(GateLog)
GateLogSchema.index({ schoolId: 1, timestamp: -1 })
