import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Facility Registry ───────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'facilities' })
export class Facility {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop({ enum: ['CLASSROOM', 'OFFICE', 'LAB', 'LIBRARY', 'SPORTS', 'HOSTEL', 'ADMIN', 'KITCHEN', 'STORE', 'TOILET', 'GENERAL'], required: true })
  type: string

  @Prop()
  floorNumber?: number

  @Prop()
  block?: string

  @Prop()
  capacity?: number

  @Prop()
  description?: string

  @Prop({ type: [String], default: [] })
  amenities: string[]

  @Prop({ enum: ['GOOD', 'FAIR', 'NEEDS_MAINTENANCE', 'CLOSED'], default: 'GOOD' })
  condition: string

  @Prop()
  lastInspectionDate?: Date

  @Prop()
  imageUrl?: string

  @Prop({ default: true })
  isActive: boolean
}

export const FacilitySchema = SchemaFactory.createForClass(Facility)

// ─── Maintenance Request ─────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'maintenance_requests' })
export class MaintenanceRequest {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true, unique: true })
  ticketNumber: string

  @Prop({ type: Types.ObjectId, ref: 'Facility' })
  facilityId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedById: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop({ required: true })
  description: string

  @Prop({ enum: ['ELECTRICAL', 'PLUMBING', 'CARPENTRY', 'PAINTING', 'HVAC', 'GENERATOR', 'CLEANING', 'IT', 'FURNITURE', 'ROOFING', 'GENERAL'], required: true })
  category: string

  @Prop({ enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], required: true })
  priority: string

  // CRITICAL = safety hazard, fix immediately
  // HIGH = disrupts learning, fix within 24hr
  // MEDIUM = fix within 3 days
  // LOW = fix within 1 week

  @Prop({ type: [String], default: [] })
  photoUrls: string[]

  @Prop({ type: [String], default: [] })
  photoPublicIds: string[]

  @Prop({ enum: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'REJECTED', 'CANCELLED'], default: 'OPEN', index: true })
  status: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedToId?: Types.ObjectId

  @Prop()
  assignedAt?: Date

  @Prop()
  estimatedCompletionDate?: Date

  @Prop()
  actualCompletionDate?: Date

  @Prop()
  completionNotes?: string

  @Prop({ type: [String], default: [] })
  completionPhotoUrls: string[]

  @Prop({ default: 0 })
  estimatedCost: number

  @Prop({ default: 0 })
  actualCost: number

  @Prop({ type: [String], default: [] })
  partsUsed: string[]

  // Rating by requester after completion
  @Prop({ min: 1, max: 5 })
  rating?: number

  @Prop()
  ratingComment?: string

  @Prop({
    type: [
      { date: Date, message: String, userId: { type: Types.ObjectId, ref: 'User' }, isInternal: Boolean },
    ],
    default: [],
  })
  updates: { date: Date; message: string; userId: Types.ObjectId; isInternal: boolean }[]

  // SLA tracking
  @Prop()
  slaDeadline?: Date

  @Prop({ default: false })
  slaBreach: boolean
}

export const MaintenanceRequestSchema = SchemaFactory.createForClass(MaintenanceRequest)
MaintenanceRequestSchema.index({ schoolId: 1, status: 1, priority: 1 })
MaintenanceRequestSchema.index({ assignedToId: 1, status: 1 })

// ─── Preventive Maintenance Schedule ────────────────────────────────────────

@Schema({ timestamps: true, collection: 'preventive_maintenance' })
export class PreventiveMaintenance {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  title: string

  @Prop()
  description?: string

  @Prop({ required: true })
  category: string

  @Prop({ type: Types.ObjectId, ref: 'Facility' })
  facilityId?: Types.ObjectId

  @Prop({ enum: ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'], required: true })
  frequency: string

  @Prop({ required: true })
  nextDueDate: Date

  @Prop()
  lastCompletedDate?: Date

  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedToId?: Types.ObjectId

  @Prop({ type: [String], default: [] })
  checklistItems: string[]

  @Prop({ default: 0 })
  estimatedDurationMinutes: number

  @Prop({ default: 0 })
  estimatedCost: number

  @Prop({ default: true })
  isActive: boolean

  @Prop({
    type: [{ date: Date, completedById: Types.ObjectId, notes: String, photoUrls: [String] }],
    default: [],
  })
  completionHistory: { date: Date; completedById: Types.ObjectId; notes?: string; photoUrls: string[] }[]
}

export const PreventiveMaintenanceSchema = SchemaFactory.createForClass(PreventiveMaintenance)

// ─── Cleaning Schedule ───────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'cleaning_schedules' })
export class CleaningSchedule {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Facility', required: true })
  facilityId: Types.ObjectId

  @Prop({ required: true })
  cleaningType: string // sweep, mop, deep clean, sanitize

  @Prop({ enum: ['DAILY', 'TWICE_DAILY', 'WEEKLY', 'AS_NEEDED'], required: true })
  frequency: string

  @Prop({ type: [Number], default: [] })
  scheduledDays: number[] // 0-6

  @Prop()
  scheduledTime?: string

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  assignedCleanerIds: Types.ObjectId[]

  @Prop({
    type: [
      {
        date: Date,
        completedById: Types.ObjectId,
        inspectorId: Types.ObjectId,
        rating: Number, // 1-5
        notes: String,
      },
    ],
    default: [],
  })
  inspectionLog: {
    date: Date
    completedById: Types.ObjectId
    inspectorId?: Types.ObjectId
    rating?: number
    notes?: string
  }[]
}

export const CleaningScheduleSchema = SchemaFactory.createForClass(CleaningSchedule)
