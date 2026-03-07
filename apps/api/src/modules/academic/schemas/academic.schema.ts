import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Academic Year ─────────────────────────────────────────────────────────────

export type AcademicYearDocument = AcademicYear & Document

@Schema({ timestamps: true, collection: 'academic_years' })
export class AcademicYear {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ required: true, trim: true }) // e.g. "2024/2025"
  name: string

  @Prop({ required: true })
  startDate: Date

  @Prop({ required: true })
  endDate: Date

  @Prop({ default: false, index: true })
  isCurrent: boolean

  @Prop({
    type: [{
      name: String,
      number: { type: Number, enum: [1, 2, 3] },
      startDate: Date,
      endDate: Date,
      isActive: { type: Boolean, default: false },
      midTermBreakStart: Date,
      midTermBreakEnd: Date,
    }],
  })
  terms: Array<{
    name: string
    number: 1 | 2 | 3
    startDate: Date
    endDate: Date
    isActive: boolean
    midTermBreakStart?: Date
    midTermBreakEnd?: Date
  }>
}

export const AcademicYearSchema = SchemaFactory.createForClass(AcademicYear)
AcademicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true })

// ─── Subject ───────────────────────────────────────────────────────────────────

export type SubjectDocument = Subject & Document

export enum SubjectCategory {
  CORE = 'core',
  ELECTIVE = 'elective',
  VOCATIONAL = 'vocational',
  EXTRACURRICULAR = 'extracurricular',
}

@Schema({ timestamps: true, collection: 'subjects' })
export class Subject {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ required: true, trim: true })
  name: string

  @Prop({ required: true, trim: true, uppercase: true })
  code: string // e.g. MATH, ENG, PHY

  @Prop({ trim: true })
  description?: string

  @Prop({ enum: Object.values(SubjectCategory), default: SubjectCategory.CORE })
  category: SubjectCategory

  @Prop({ default: 1 })
  creditUnits: number

  @Prop()
  color?: string // For timetable display

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: [String], default: [] }) // Grade levels this subject applies to
  applicableLevels: string[]
}

export const SubjectSchema = SchemaFactory.createForClass(Subject)
SubjectSchema.index({ schoolId: 1, code: 1 }, { unique: true })

// ─── Class Room ────────────────────────────────────────────────────────────────

export type ClassRoomDocument = ClassRoom & Document

@Schema({ timestamps: true, collection: 'classrooms' })
export class ClassRoom {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId

  @Prop({ required: true, trim: true }) // e.g. "JSS 1A"
  name: string

  @Prop({ required: true, trim: true }) // e.g. "JSS 1" (without section)
  level: string

  @Prop({ trim: true }) // e.g. "A", "B", "Gold"
  section?: string

  @Prop({ default: 40 })
  capacity: number

  @Prop({ type: Types.ObjectId, ref: 'User' })
  classTeacherId?: Types.ObjectId

  @Prop({
    type: [{
      subjectId: { type: Types.ObjectId, ref: 'Subject' },
      teacherId: { type: Types.ObjectId, ref: 'User' },
      hoursPerWeek: { type: Number, default: 3 },
    }],
  })
  subjects: Array<{
    subjectId: Types.ObjectId
    teacherId?: Types.ObjectId
    hoursPerWeek: number
  }>

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear' })
  academicYearId?: Types.ObjectId
}

export const ClassRoomSchema = SchemaFactory.createForClass(ClassRoom)
ClassRoomSchema.index({ schoolId: 1, name: 1, academicYearId: 1 }, { unique: true })

// ─── Timetable ─────────────────────────────────────────────────────────────────

export type TimetableDocument = Timetable & Document

export enum DayOfWeek {
  MONDAY = 'Monday',
  TUESDAY = 'Tuesday',
  WEDNESDAY = 'Wednesday',
  THURSDAY = 'Thursday',
  FRIDAY = 'Friday',
  SATURDAY = 'Saturday',
}

@Schema({ timestamps: true, collection: 'timetables' })
export class Timetable {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'ClassRoom', required: true, index: true })
  classId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear', required: true })
  academicYearId: Types.ObjectId

  @Prop({ required: true, enum: Object.values(DayOfWeek) })
  day: DayOfWeek

  @Prop({ required: true }) // e.g. "08:00"
  startTime: string

  @Prop({ required: true }) // e.g. "09:00"
  endTime: string

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  teacherId: Types.ObjectId

  @Prop({ trim: true }) // e.g. room number
  venue?: string

  @Prop({ default: false })
  isBreak: boolean // for break periods

  @Prop({ trim: true })
  breakLabel?: string // e.g. "Lunch Break"
}

export const TimetableSchema = SchemaFactory.createForClass(Timetable)
TimetableSchema.index({ classId: 1, day: 1, startTime: 1 })
TimetableSchema.index({ teacherId: 1, day: 1 }) // Check teacher availability
