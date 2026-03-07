import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Hostel Block ────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'hostel_blocks' })
export class HostelBlock {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ enum: ['BOYS', 'GIRLS', 'MIXED'], required: true })
  gender: string

  @Prop({ required: true, default: 0 })
  totalRooms: number

  @Prop({ required: true, default: 0 })
  totalBeds: number

  @Prop({ default: 0 })
  occupiedBeds: number

  @Prop({ type: Types.ObjectId, ref: 'User' })
  houseParentId?: Types.ObjectId

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  prefectIds: Types.ObjectId[]

  @Prop()
  facilities?: string

  @Prop({ default: true })
  isActive: boolean
}

export const HostelBlockSchema = SchemaFactory.createForClass(HostelBlock)

// ─── Hostel Room ─────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'hostel_rooms' })
export class HostelRoom {
  @Prop({ type: Types.ObjectId, ref: 'HostelBlock', required: true, index: true })
  blockId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ required: true })
  roomNumber: string

  @Prop({ required: true })
  capacity: number

  @Prop({ default: 0 })
  occupiedBeds: number

  @Prop({ enum: ['AVAILABLE', 'FULL', 'MAINTENANCE', 'RESERVED'], default: 'AVAILABLE' })
  status: string

  @Prop({ type: [String], default: [] })
  amenities: string[]

  @Prop()
  floorNumber?: number
}

export const HostelRoomSchema = SchemaFactory.createForClass(HostelRoom)

// ─── Hostel Allocation ───────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'hostel_allocations' })
export class HostelAllocation {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'HostelBlock', required: true })
  blockId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'HostelRoom', required: true })
  roomId: Types.ObjectId

  @Prop({ required: true })
  bedNumber: string

  @Prop({ type: Types.ObjectId, ref: 'Term', required: true })
  termId: Types.ObjectId

  @Prop({ required: true })
  checkInDate: Date

  @Prop()
  checkOutDate?: Date

  @Prop({ enum: ['ACTIVE', 'CHECKED_OUT', 'TRANSFERRED'], default: 'ACTIVE' })
  status: string

  @Prop({ default: 0 })
  feeAmount: number

  @Prop({ default: false })
  feePaid: boolean
}

export const HostelAllocationSchema = SchemaFactory.createForClass(HostelAllocation)

// ─── Weekend Leave / Exeat ───────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'hostel_exeats' })
export class HostelExeat {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'HostelAllocation', required: true })
  allocationId: Types.ObjectId

  @Prop({ required: true })
  departureDate: Date

  @Prop({ required: true })
  expectedReturnDate: Date

  @Prop()
  actualReturnDate?: Date

  @Prop({ required: true })
  destination: string

  @Prop({ required: true })
  escortName: string

  @Prop({ required: true })
  escortRelationship: string

  @Prop({ required: true })
  escortPhone: string

  @Prop({ enum: ['PENDING', 'APPROVED', 'REJECTED', 'RETURNED', 'OVERDUE'], default: 'PENDING' })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedById?: Types.ObjectId

  @Prop()
  reason?: string

  @Prop({ default: false })
  parentConsentReceived: boolean
}

export const HostelExeatSchema = SchemaFactory.createForClass(HostelExeat)

// ─── Hostel Incident ─────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'hostel_incidents' })
export class HostelIncident {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'HostelBlock', required: true })
  blockId: Types.ObjectId

  @Prop({ required: true })
  incidentDate: Date

  @Prop({ enum: ['THEFT', 'FIGHT', 'MEDICAL', 'PROPERTY_DAMAGE', 'MISSING_STUDENT', 'BULLYING', 'OTHER'], required: true })
  type: string

  @Prop({ required: true })
  description: string

  @Prop({ type: [Types.ObjectId], ref: 'Student', default: [] })
  involvedStudentIds: Types.ObjectId[]

  @Prop({ enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], default: 'MEDIUM' })
  severity: string

  @Prop()
  actionTaken?: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedById: Types.ObjectId

  @Prop({ default: false })
  parentNotified: boolean

  @Prop({ default: false })
  policeInvolved: boolean

  @Prop({ default: false })
  resolved: boolean

  @Prop()
  evidenceUrl?: string
}

export const HostelIncidentSchema = SchemaFactory.createForClass(HostelIncident)

// ─── Hostel Visitor Log ──────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'hostel_visitors' })
export class HostelVisitor {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'HostelBlock', required: true })
  blockId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  visitingStudentId: Types.ObjectId

  @Prop({ required: true })
  visitorName: string

  @Prop({ required: true })
  visitorRelationship: string

  @Prop({ required: true })
  visitorPhone: string

  @Prop()
  visitorIdType?: string

  @Prop()
  visitorIdNumber?: string

  @Prop({ required: true })
  visitDate: Date

  @Prop({ required: true })
  checkInTime: Date

  @Prop()
  checkOutTime?: Date

  @Prop()
  purpose?: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  approvedById: Types.ObjectId
}

export const HostelVisitorSchema = SchemaFactory.createForClass(HostelVisitor)
