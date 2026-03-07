import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Student Health Profile ──────────────────────────────────────────────────

export type StudentHealthDocument = StudentHealth & Document

@Schema({ timestamps: true, collection: 'student_health' })
export class StudentHealth {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, unique: true })
  studentId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  // Vitals
  @Prop({ enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] })
  bloodGroup?: string

  @Prop()
  genotype?: string

  @Prop({ type: [String], default: [] })
  allergies: string[]

  @Prop({ type: [String], default: [] })
  chronicConditions: string[]

  @Prop({
    type: [
      {
        condition: String,
        severity: { type: String, enum: ['MILD', 'MODERATE', 'SEVERE'] },
        emergencyProtocol: String,
        medications: [String],
      },
    ],
    default: [],
  })
  medicalConditions: {
    condition: string
    severity: string
    emergencyProtocol: string
    medications: string[]
  }[]

  // Current medications
  @Prop({
    type: [
      {
        name: String,
        dosage: String,
        frequency: String,
        schedule: [String],
        prescribedBy: String,
        endDate: Date,
        storageInstructions: String,
        parentConsent: { type: Boolean, default: false },
        consentFormUrl: String,
      },
    ],
    default: [],
  })
  medications: {
    name: string
    dosage: string
    frequency: string
    schedule: string[]
    prescribedBy: string
    endDate?: Date
    storageInstructions?: string
    parentConsent: boolean
    consentFormUrl?: string
  }[]

  // Doctor & Hospital
  @Prop()
  familyDoctorName?: string

  @Prop()
  familyDoctorPhone?: string

  @Prop()
  preferredHospital?: string

  @Prop()
  hospitalPhone?: string

  // Insurance
  @Prop()
  insuranceProvider?: string

  @Prop()
  insurancePolicyNumber?: string

  @Prop()
  insuranceExpiry?: Date

  // Immunization
  @Prop({
    type: [
      {
        vaccineName: String,
        dateGiven: Date,
        nextDue: Date,
        administeredBy: String,
        batchNumber: String,
        documentUrl: String,
        status: { type: String, enum: ['COMPLETE', 'DUE', 'OVERDUE', 'EXEMPTED'] },
      },
    ],
    default: [],
  })
  immunizations: {
    vaccineName: string
    dateGiven?: Date
    nextDue?: Date
    administeredBy?: string
    batchNumber?: string
    documentUrl?: string
    status: string
  }[]

  // Dental & Vision
  @Prop()
  lastDentalCheckup?: Date

  @Prop()
  dentalNotes?: string

  @Prop()
  lastVisionTest?: Date

  @Prop({ default: false })
  wearsGlasses: boolean

  @Prop()
  prescriptionStrength?: string

  @Prop({ default: false })
  wearsHearingAid: boolean

  // Physical disability / special needs
  @Prop({ default: false })
  hasSpecialNeeds: boolean

  @Prop()
  specialNeedsDescription?: string

  @Prop()
  individualEducationPlanUrl?: string

  // Emergency
  @Prop({
    type: [
      {
        name: { type: String, required: true },
        relationship: String,
        phone: { type: String, required: true },
        alternatePhone: String,
      },
    ],
    default: [],
  })
  emergencyContacts: { name: string; relationship: string; phone: string; alternatePhone?: string }[]

  @Prop()
  additionalMedicalNotes?: string
}

export const StudentHealthSchema = SchemaFactory.createForClass(StudentHealth)

// ─── Clinic Visit Log ────────────────────────────────────────────────────────

export type ClinicVisitDocument = ClinicVisit & Document

@Schema({ timestamps: true, collection: 'clinic_visits' })
export class ClinicVisit {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ type: Types.ObjectId })
  patientId: Types.ObjectId

  @Prop({ enum: ['STUDENT', 'STAFF'], required: true })
  patientType: string

  @Prop({ required: true })
  visitDate: Date

  @Prop({ required: true })
  visitTime: string

  @Prop({ required: true })
  complaint: string

  @Prop()
  temperature?: number

  @Prop()
  bloodPressure?: string

  @Prop()
  pulse?: number

  @Prop()
  weight?: number

  @Prop({ required: true })
  assessment: string

  @Prop({ type: [String], default: [] })
  treatmentGiven: string[]

  @Prop({
    type: [
      {
        medicationId: { type: Types.ObjectId, ref: 'MedicalInventory' },
        name: String,
        dosage: String,
        quantity: Number,
      },
    ],
    default: [],
  })
  medicationsDispensed: { medicationId?: Types.ObjectId; name: string; dosage: string; quantity: number }[]

  @Prop({ default: false })
  restedInClinic: boolean

  @Prop()
  restDuration?: number // minutes

  @Prop({ default: false })
  parentNotified: boolean

  @Prop()
  parentNotificationTime?: Date

  @Prop({ enum: ['SENT_HOME', 'REFERRED_HOSPITAL', 'RETURNED_CLASS', 'STILL_IN_CLINIC', 'AMBULANCE_CALLED'], required: true })
  outcome: string

  @Prop({ type: Types.ObjectId, ref: 'User' })
  attendedById: Types.ObjectId // nurse/health officer

  @Prop()
  followUpRequired: boolean

  @Prop()
  followUpDate?: Date

  @Prop()
  incidentReportUrl?: string // for serious incidents
}

export const ClinicVisitSchema = SchemaFactory.createForClass(ClinicVisit)
ClinicVisitSchema.index({ schoolId: 1, visitDate: -1 })
ClinicVisitSchema.index({ patientId: 1, patientType: 1 })

// ─── Medical Inventory ───────────────────────────────────────────────────────

export type MedicalInventoryDocument = MedicalInventory & Document

@Schema({ timestamps: true, collection: 'medical_inventory' })
export class MedicalInventory {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', required: true })
  branchId: Types.ObjectId

  @Prop({ required: true })
  name: string

  @Prop()
  genericName?: string

  @Prop({ enum: ['MEDICATION', 'FIRST_AID', 'EQUIPMENT', 'CONSUMABLE'], required: true })
  category: string

  @Prop({ required: true, default: 0 })
  quantityInStock: number

  @Prop({ required: true })
  unit: string // tablets, ml, pieces

  @Prop({ required: true })
  reorderLevel: number

  @Prop()
  expiryDate?: Date

  @Prop()
  batchNumber?: string

  @Prop()
  supplier?: string

  @Prop()
  storageInstructions?: string

  @Prop({ default: true })
  requiresPrescription: boolean

  @Prop({ default: true })
  isActive: boolean
}

export const MedicalInventorySchema = SchemaFactory.createForClass(MedicalInventory)

// ─── Staff Health Record ─────────────────────────────────────────────────────

@Schema({ timestamps: true, collection: 'staff_health' })
export class StaffHealth {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop()
  bloodGroup?: string

  @Prop()
  genotype?: string

  @Prop({ type: [String], default: [] })
  allergies: string[]

  @Prop()
  preEmploymentMedicalUrl?: string

  @Prop()
  preEmploymentMedicalDate?: Date

  @Prop()
  lastAnnualMedicalDate?: Date

  @Prop()
  nextAnnualMedicalDue?: Date

  @Prop()
  annualMedicalUrl?: string

  @Prop({
    type: [{ vaccineName: String, date: Date, documentUrl: String }],
    default: [],
  })
  vaccinations: { vaccineName: string; date: Date; documentUrl?: string }[]

  @Prop()
  emergencyContactName?: string

  @Prop()
  emergencyContactPhone?: string

  @Prop()
  emergencyContactRelationship?: string
}

export const StaffHealthSchema = SchemaFactory.createForClass(StaffHealth)
