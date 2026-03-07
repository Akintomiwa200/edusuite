import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Vehicle ─────────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'vehicles' })
export class Vehicle {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  registrationNumber: string

  @Prop({ required: true })
  make: string

  @Prop({ required: true })
  model: string

  @Prop({ required: true })
  year: number

  @Prop({ enum: ['BUS', 'MINIBUS', 'VAN', 'CAR', 'COASTER'], required: true })
  type: string

  @Prop({ required: true })
  seatingCapacity: number

  @Prop()
  color?: string

  @Prop()
  imageUrl?: string

  // Insurance
  @Prop()
  insuranceProvider?: string

  @Prop()
  insurancePolicyNumber?: string

  @Prop()
  insuranceExpiry?: Date

  @Prop()
  insuranceDocumentUrl?: string

  // Roadworthiness
  @Prop()
  roadworthinessExpiry?: Date

  @Prop()
  roadworthinessDocUrl?: string

  // Maintenance
  @Prop()
  lastServiceDate?: Date

  @Prop()
  nextServiceDueDate?: Date

  @Prop()
  nextServiceMileage?: number

  @Prop()
  currentMileage?: number

  // GPS
  @Prop()
  gpsDeviceId?: string

  @Prop()
  currentLatitude?: number

  @Prop()
  currentLongitude?: number

  @Prop()
  lastLocationUpdate?: Date

  // Assignment
  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedDriverId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'TransportRoute' })
  assignedRouteId?: Types.ObjectId

  @Prop({ enum: ['ACTIVE', 'MAINTENANCE', 'INACTIVE', 'DECOMMISSIONED'], default: 'ACTIVE' })
  status: string

  // Fuel
  @Prop({ type: [{ date: Date, litres: Number, cost: Number, mileage: Number, filledById: Types.ObjectId }], default: [] })
  fuelLog: { date: Date; litres: number; cost: number; mileage: number; filledById: Types.ObjectId }[]
}

export const VehicleSchema = SchemaFactory.createForClass(Vehicle)

// ─── Driver ──────────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'drivers' })
export class Driver {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ required: true })
  licenseNumber: string

  @Prop({ required: true })
  licenseClass: string

  @Prop({ required: true })
  licenseExpiry: Date

  @Prop()
  licenseDocumentUrl?: string

  @Prop({ enum: ['VALID', 'EXPIRED', 'SUSPENDED'], default: 'VALID' })
  licenseStatus: string

  @Prop()
  backgroundCheckDate?: Date

  @Prop({ enum: ['CLEAR', 'PENDING', 'FAILED'], default: 'PENDING' })
  backgroundCheckStatus: string

  @Prop()
  medicalCertificateUrl?: string

  @Prop()
  medicalCertificateExpiry?: Date

  @Prop({
    type: [{ courseName: String, completedDate: Date, certificateUrl: String }],
    default: [],
  })
  trainingRecords: { courseName: string; completedDate: Date; certificateUrl?: string }[]

  @Prop({ default: 0 })
  totalTrips: number

  @Prop({ default: 0 })
  totalHoursLogged: number

  @Prop({ type: [{ date: Date, type: String, description: String }], default: [] })
  incidents: { date: Date; type: string; description: string }[]
}

export const DriverSchema = SchemaFactory.createForClass(Driver)

// ─── Transport Route ─────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'transport_routes' })
export class TransportRoute {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop()
  description?: string

  @Prop({ enum: ['MORNING', 'AFTERNOON', 'BOTH'], default: 'BOTH' })
  direction: string

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        address: String,
        latitude: Number,
        longitude: Number,
        pickupTime: String,
        dropoffTime: String,
        order: { type: Number, required: true },
        landmark: String,
      },
    ],
    required: true,
  })
  stops: {
    name: string
    address?: string
    latitude?: number
    longitude?: number
    pickupTime: string
    dropoffTime: string
    order: number
    landmark?: string
  }[]

  @Prop({ type: Types.ObjectId, ref: 'Vehicle' })
  vehicleId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Driver' })
  driverId?: Types.ObjectId

  @Prop({ default: 0 })
  estimatedDurationMinutes: number

  @Prop({ default: 0 })
  distanceKm: number

  @Prop({ default: 0 })
  feePerTerm: number

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: [Types.ObjectId], ref: 'Student', default: [] })
  enrolledStudentIds: Types.ObjectId[]

  @Prop({ default: 0 })
  capacity: number
}

export const TransportRouteSchema = SchemaFactory.createForClass(TransportRoute)

// ─── Trip Log ────────────────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'trip_logs' })
export class TripLog {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'TransportRoute', required: true })
  routeId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Vehicle', required: true })
  vehicleId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Driver', required: true })
  driverId: Types.ObjectId

  @Prop({ required: true })
  date: Date

  @Prop({ enum: ['MORNING', 'AFTERNOON'] })
  tripType: string

  @Prop()
  actualDepartureTime?: Date

  @Prop()
  actualArrivalTime?: Date

  @Prop()
  startMileage?: number

  @Prop()
  endMileage?: number

  @Prop({ enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DELAYED'], default: 'SCHEDULED' })
  status: string

  @Prop()
  delayReason?: string

  @Prop({
    type: [
      {
        studentId: { type: Types.ObjectId, ref: 'Student' },
        stopName: String,
        boardedAt: Date,
        alightedAt: Date,
        wasPresent: { type: Boolean, default: true },
        parentNotified: { type: Boolean, default: false },
      },
    ],
    default: [],
  })
  studentLog: {
    studentId: Types.ObjectId
    stopName: string
    boardedAt?: Date
    alightedAt?: Date
    wasPresent: boolean
    parentNotified: boolean
  }[]

  @Prop()
  driverNotes?: string

  @Prop()
  incidentReportId?: string
}

export const TripLogSchema = SchemaFactory.createForClass(TripLog)

// ─── Transport Enrollment ────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'transport_enrollments' })
export class TransportEnrollment {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true })
  studentId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'TransportRoute', required: true })
  routeId: Types.ObjectId

  @Prop()
  boardingStop: string

  @Prop()
  alightingStop: string

  @Prop({ type: Types.ObjectId, ref: 'Term', required: true })
  termId: Types.ObjectId

  @Prop({ default: false })
  feePaid: boolean

  @Prop({ default: 0 })
  feeAmount: number

  @Prop({ default: true })
  isActive: boolean

  @Prop()
  parentContactForPickup?: string

  @Prop({ default: false })
  morningService: boolean

  @Prop({ default: false })
  afternoonService: boolean
}

export const TransportEnrollmentSchema = SchemaFactory.createForClass(TransportEnrollment)
