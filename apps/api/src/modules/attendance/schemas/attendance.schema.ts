import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

export type AttendanceDocument = Attendance & Document
export type StaffAttendanceDocument = StaffAttendance & Document

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
  HALF_DAY = 'half_day',
}

@Schema({ timestamps: true, collection: 'attendance' })
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'ClassRoom', required: true, index: true })
  classId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ required: true, index: true })
  date: Date

  @Prop({ enum: Object.values(AttendanceStatus), required: true, index: true })
  status: AttendanceStatus

  @Prop({ type: Types.ObjectId, ref: 'Subject' })
  subjectId?: Types.ObjectId // For period-based attendance

  @Prop({ type: Number, enum: [1, 2, 3] })
  termNumber?: 1 | 2 | 3

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear' })
  academicYearId?: Types.ObjectId

  @Prop({ trim: true })
  remarks?: string

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  takenBy: Types.ObjectId

  @Prop({ default: false })
  parentNotified: boolean

  @Prop()
  checkInTime?: Date

  @Prop()
  checkOutTime?: Date
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance)
AttendanceSchema.index({ schoolId: 1, classId: 1, date: 1 })
AttendanceSchema.index({ studentId: 1, date: 1 }, { unique: false })
AttendanceSchema.index({ schoolId: 1, date: 1, status: 1 })

@Schema({ timestamps: true, collection: 'staff_attendance' })
export class StaffAttendance {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  staffId: Types.ObjectId

  @Prop({ required: true, index: true })
  date: Date

  @Prop({ enum: Object.values(AttendanceStatus), required: true })
  status: AttendanceStatus

  @Prop()
  clockIn?: Date

  @Prop()
  clockOut?: Date

  @Prop({ trim: true })
  remarks?: string

  @Prop({ type: Number, default: 0 }) // minutes worked
  workedMinutes?: number
}

export const StaffAttendanceSchema = SchemaFactory.createForClass(StaffAttendance)
StaffAttendanceSchema.index({ schoolId: 1, staffId: 1, date: 1 }, { unique: true })
