import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export enum EventType {
  ACADEMIC = 'ACADEMIC',
  SPORTS = 'SPORTS',
  CULTURAL = 'CULTURAL',
  PTA_MEETING = 'PTA_MEETING',
  STAFF_MEETING = 'STAFF_MEETING',
  OPEN_DAY = 'OPEN_DAY',
  GRADUATION = 'GRADUATION',
  FOUNDERS_DAY = 'FOUNDERS_DAY',
  EXCURSION = 'EXCURSION',
  WORKSHOP = 'WORKSHOP',
  HEALTH_SCREENING = 'HEALTH_SCREENING',
  INTER_HOUSE = 'INTER_HOUSE',
  PARENTS_EVENING = 'PARENTS_EVENING',
  OTHER = 'OTHER',
}

@Schema({ timestamps: true, collection: 'events' })
export class SchoolEvent {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: [Types.ObjectId], ref: 'Branch', default: [] })
  branchIds: Types.ObjectId[] // empty = all branches

  @Prop({ required: true })
  title: string

  @Prop()
  description?: string

  @Prop({ required: true, enum: Object.values(EventType) })
  type: EventType

  @Prop({ required: true })
  startDate: Date

  @Prop({ required: true })
  endDate: Date

  @Prop()
  venue?: string

  @Prop({ enum: ['ONLINE', 'IN_PERSON', 'HYBRID'], default: 'IN_PERSON' })
  format: string

  @Prop({ required: true, enum: ['STUDENTS', 'STAFF', 'PARENTS', 'ALL', 'SELECTED_CLASSES', 'PUBLIC'] })
  audience: string

  @Prop({ type: [Types.ObjectId], ref: 'Class', default: [] })
  targetClassIds: Types.ObjectId[]

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  organizerId: Types.ObjectId

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  committeeIds: Types.ObjectId[]

  // Budget
  @Prop({ default: 0 })
  estimatedBudget: number

  @Prop({ default: 0 })
  approvedBudget: number

  @Prop({ default: 0 })
  actualSpend: number

  @Prop({ enum: ['PENDING_BUDGET', 'BUDGET_APPROVED', 'PLANNING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'], default: 'PLANNING' })
  status: string

  // RSVP
  @Prop({ default: false })
  requiresRsvp: boolean

  @Prop()
  rsvpDeadline?: Date

  @Prop({ default: 0 })
  maxCapacity: number

  @Prop({
    type: [
      {
        userId: { type: Types.ObjectId, ref: 'User' },
        response: { type: String, enum: ['YES', 'NO', 'MAYBE'] },
        respondedAt: Date,
        guestCount: { type: Number, default: 0 },
        notes: String,
      },
    ],
    default: [],
  })
  rsvpResponses: {
    userId: Types.ObjectId
    response: string
    respondedAt: Date
    guestCount: number
    notes?: string
  }[]

  // Tasks
  @Prop({
    type: [
      {
        title: String,
        assignedToId: { type: Types.ObjectId, ref: 'User' },
        dueDate: Date,
        status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'DONE'], default: 'TODO' },
        priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
        notes: String,
      },
    ],
    default: [],
  })
  tasks: {
    title: string
    assignedToId: Types.ObjectId
    dueDate: Date
    status: string
    priority: string
    notes?: string
  }[]

  // Run of show (timed agenda)
  @Prop({
    type: [
      {
        time: String,
        activity: String,
        duration: Number,
        responsiblePerson: String,
        notes: String,
      },
    ],
    default: [],
  })
  runOfShow: {
    time: string
    activity: string
    duration: number
    responsiblePerson?: string
    notes?: string
  }[]

  // Post-event
  @Prop()
  feedbackFormUrl?: string

  @Prop({
    type: {
      averageRating: Number,
      totalResponses: Number,
      comments: [String],
    },
  })
  feedback?: { averageRating: number; totalResponses: number; comments: string[] }

  @Prop({ type: [String], default: [] })
  photoUrls: string[]

  @Prop()
  reportDocUrl?: string

  // Venue booking
  @Prop()
  venueBookingStatus?: string

  @Prop({
    type: [
      {
        item: String,
        quantity: Number,
        arranged: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  setupRequirements: { item: string; quantity: number; arranged: boolean }[]

  @Prop()
  cateringNotes?: string
}

export const SchoolEventSchema = SchemaFactory.createForClass(SchoolEvent)
SchoolEventSchema.index({ schoolId: 1, startDate: 1, status: 1 })
SchoolEventSchema.index({ schoolId: 1, type: 1 })

// ─── Venue Booking ───────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'venue_bookings' })
export class VenueBooking {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ required: true })
  venueName: string

  @Prop({ type: Types.ObjectId, ref: 'SchoolEvent' })
  eventId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  bookedById: Types.ObjectId

  @Prop({ required: true })
  startDateTime: Date

  @Prop({ required: true })
  endDateTime: Date

  @Prop()
  purpose: string

  @Prop({ enum: ['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED'], default: 'PENDING' })
  status: string

  @Prop()
  notes?: string
}

export const VenueBookingSchema = SchemaFactory.createForClass(VenueBooking)
