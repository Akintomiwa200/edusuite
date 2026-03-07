import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Attendance, AttendanceDocument, AttendanceStatus, StaffAttendance, StaffAttendanceDocument } from './schemas/attendance.schema'

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name)

  constructor(
    @InjectModel(Attendance.name) private attendanceModel: Model<AttendanceDocument>,
    @InjectModel(StaffAttendance.name) private staffAttendanceModel: Model<StaffAttendanceDocument>,
  ) {}

  // ─── Take Attendance ──────────────────────────────────────────────────────

  async markClassAttendance(schoolId: string, dto: {
    classId: string
    date: Date
    records: Array<{ studentId: string; status: AttendanceStatus; remarks?: string }>
    takenBy: string
    academicYearId?: string
    termNumber?: 1 | 2 | 3
    subjectId?: string
  }) {
    const dateOnly = new Date(dto.date)
    dateOnly.setHours(0, 0, 0, 0)

    // Check for duplicates
    const existing = await this.attendanceModel.findOne({
      schoolId,
      classId: new Types.ObjectId(dto.classId),
      date: dateOnly,
      ...(dto.subjectId && { subjectId: new Types.ObjectId(dto.subjectId) }),
    })
    if (existing) {
      // Update existing attendance instead
      return this.updateClassAttendance(schoolId, dto.classId, dateOnly, dto)
    }

    const docs = dto.records.map((r) => ({
      schoolId,
      classId: new Types.ObjectId(dto.classId),
      studentId: new Types.ObjectId(r.studentId),
      date: dateOnly,
      status: r.status,
      remarks: r.remarks,
      takenBy: new Types.ObjectId(dto.takenBy),
      academicYearId: dto.academicYearId ? new Types.ObjectId(dto.academicYearId) : undefined,
      termNumber: dto.termNumber,
      subjectId: dto.subjectId ? new Types.ObjectId(dto.subjectId) : undefined,
    }))

    await this.attendanceModel.insertMany(docs)
    this.logger.log(`Attendance marked for class ${dto.classId} on ${dateOnly.toDateString()}`)
    return { marked: docs.length, date: dateOnly }
  }

  async updateClassAttendance(schoolId: string, classId: string, date: Date, dto: any) {
    const results = await Promise.allSettled(
      dto.records.map((r: any) =>
        this.attendanceModel.findOneAndUpdate(
          {
            schoolId,
            classId: new Types.ObjectId(classId),
            studentId: new Types.ObjectId(r.studentId),
            date,
          },
          { $set: { status: r.status, remarks: r.remarks, takenBy: new Types.ObjectId(dto.takenBy) } },
          { upsert: true, new: true },
        ),
      ),
    )
    return { updated: results.filter((r) => r.status === 'fulfilled').length }
  }

  async getClassAttendance(schoolId: string, classId: string, date: Date) {
    const dateOnly = new Date(date)
    dateOnly.setHours(0, 0, 0, 0)

    return this.attendanceModel
      .find({ schoolId, classId: new Types.ObjectId(classId), date: dateOnly })
      .populate('studentId', 'firstName lastName admissionNumber profilePicture')
      .sort({ 'studentId.firstName': 1 })
  }

  async getStudentAttendance(studentId: string, schoolId: string, query: {
    startDate?: Date
    endDate?: Date
    academicYearId?: string
    termNumber?: number
  }) {
    const filter: any = { studentId: new Types.ObjectId(studentId), schoolId }
    if (query.startDate || query.endDate) {
      filter.date = {}
      if (query.startDate) filter.date.$gte = query.startDate
      if (query.endDate) filter.date.$lte = query.endDate
    }
    if (query.academicYearId) filter.academicYearId = new Types.ObjectId(query.academicYearId)
    if (query.termNumber) filter.termNumber = query.termNumber

    const records = await this.attendanceModel.find(filter).sort({ date: -1 })

    const summary = {
      total: records.length,
      present: records.filter((r) => r.status === AttendanceStatus.PRESENT).length,
      absent: records.filter((r) => r.status === AttendanceStatus.ABSENT).length,
      late: records.filter((r) => r.status === AttendanceStatus.LATE).length,
      excused: records.filter((r) => r.status === AttendanceStatus.EXCUSED).length,
    }

    summary['percentage'] = summary.total > 0
      ? Math.round(((summary.present + summary.late) / summary.total) * 100)
      : 0

    return { records, summary }
  }

  async getClassAttendanceSummary(schoolId: string, classId: string, query: {
    startDate?: Date
    endDate?: Date
    academicYearId?: string
    termNumber?: number
  }) {
    const match: any = {
      schoolId: new Types.ObjectId(schoolId),
      classId: new Types.ObjectId(classId),
    }
    if (query.startDate || query.endDate) {
      match.date = {}
      if (query.startDate) match.date.$gte = query.startDate
      if (query.endDate) match.date.$lte = query.endDate
    }
    if (query.academicYearId) match.academicYearId = new Types.ObjectId(query.academicYearId)
    if (query.termNumber) match.termNumber = query.termNumber

    return this.attendanceModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$studentId',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
          late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } },
          excused: { $sum: { $cond: [{ $eq: ['$status', 'excused'] }, 1, 0] } },
        },
      },
      {
        $addFields: {
          percentage: {
            $multiply: [{ $divide: [{ $add: ['$present', '$late'] }, '$total'] }, 100],
          },
        },
      },
      {
        $lookup: {
          from: 'students',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: '$student' },
      {
        $project: {
          studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
          admissionNumber: '$student.admissionNumber',
          total: 1,
          present: 1,
          absent: 1,
          late: 1,
          excused: 1,
          percentage: { $round: ['$percentage', 1] },
        },
      },
      { $sort: { percentage: 1 } }, // worst attendance first
    ])
  }

  async getAbsentStudentsToday(schoolId: string, date?: Date) {
    const today = date || new Date()
    today.setHours(0, 0, 0, 0)

    return this.attendanceModel
      .find({ schoolId, date: today, status: AttendanceStatus.ABSENT })
      .populate('studentId', 'firstName lastName admissionNumber currentClass')
      .populate('classId', 'name')
  }

  async getAttendanceTrend(schoolId: string, classId: string, days = 30) {
    const since = new Date()
    since.setDate(since.getDate() - days)

    return this.attendanceModel.aggregate([
      {
        $match: {
          schoolId: new Types.ObjectId(schoolId),
          classId: new Types.ObjectId(classId),
          date: { $gte: since },
        },
      },
      {
        $group: {
          _id: '$date',
          total: { $sum: 1 },
          present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
          absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
        },
      },
      { $addFields: { rate: { $multiply: [{ $divide: ['$present', '$total'] }, 100] } } },
      { $sort: { _id: 1 } },
    ])
  }

  // ─── Staff Attendance ─────────────────────────────────────────────────────

  async clockIn(staffId: string, schoolId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const existing = await this.staffAttendanceModel.findOne({ staffId: new Types.ObjectId(staffId), schoolId, date: today })
    if (existing?.clockIn) throw new BadRequestException('Already clocked in today')

    return this.staffAttendanceModel.findOneAndUpdate(
      { staffId: new Types.ObjectId(staffId), schoolId, date: today },
      {
        $set: {
          status: AttendanceStatus.PRESENT,
          clockIn: new Date(),
        },
      },
      { upsert: true, new: true },
    )
  }

  async clockOut(staffId: string, schoolId: string) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const record = await this.staffAttendanceModel.findOne({ staffId: new Types.ObjectId(staffId), schoolId, date: today })
    if (!record?.clockIn) throw new BadRequestException('Must clock in before clocking out')
    if (record.clockOut) throw new BadRequestException('Already clocked out today')

    const workedMinutes = Math.floor((new Date().getTime() - record.clockIn.getTime()) / 60000)

    return this.staffAttendanceModel.findByIdAndUpdate(
      record._id,
      { $set: { clockOut: new Date(), workedMinutes } },
      { new: true },
    )
  }

  async getStaffAttendance(schoolId: string, query: {
    staffId?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }) {
    const { page = 1, limit = 20, staffId, startDate, endDate } = query
    const filter: any = { schoolId }

    if (staffId) filter.staffId = new Types.ObjectId(staffId)
    if (startDate || endDate) {
      filter.date = {}
      if (startDate) filter.date.$gte = startDate
      if (endDate) filter.date.$lte = endDate
    }

    const [data, total] = await Promise.all([
      this.staffAttendanceModel
        .find(filter)
        .populate('staffId', 'firstName lastName email role')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ date: -1 }),
      this.staffAttendanceModel.countDocuments(filter),
    ])

    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
  }
}

// ─── Controller ────────────────────────────────────────────────────────────────

import {
  Controller, Get, Post, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles, CurrentUser, SchoolId } from '../../common/decorators/roles.decorator'
import { UserRole } from '@edusuite/shared-types'

@ApiTags('Attendance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('class')
  @Roles(UserRole.TEACHER, UserRole.CLASS_TEACHER, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  @ApiOperation({ summary: 'Mark attendance for a class' })
  markClassAttendance(@SchoolId() schoolId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.attendanceService.markClassAttendance(schoolId, { ...dto, takenBy: user._id })
  }

  @Get('class/:classId')
  @ApiOperation({ summary: 'Get class attendance for a date' })
  getClassAttendance(
    @Param('classId') classId: string,
    @SchoolId() schoolId: string,
    @Query('date') date: string,
  ) {
    return this.attendanceService.getClassAttendance(schoolId, classId, date ? new Date(date) : new Date())
  }

  @Get('class/:classId/summary')
  @ApiOperation({ summary: 'Get class attendance summary by student' })
  getClassSummary(@Param('classId') classId: string, @SchoolId() schoolId: string, @Query() query: any) {
    return this.attendanceService.getClassAttendanceSummary(schoolId, classId, query)
  }

  @Get('class/:classId/trend')
  @ApiOperation({ summary: 'Get attendance trend for a class' })
  getTrend(@Param('classId') classId: string, @SchoolId() schoolId: string, @Query('days') days: number) {
    return this.attendanceService.getAttendanceTrend(schoolId, classId, days || 30)
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get attendance records for a student' })
  getStudentAttendance(@Param('studentId') studentId: string, @SchoolId() schoolId: string, @Query() query: any) {
    return this.attendanceService.getStudentAttendance(studentId, schoolId, query)
  }

  @Get('my-attendance')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get my attendance records' })
  getMyAttendance(@CurrentUser() user: any, @SchoolId() schoolId: string, @Query() query: any) {
    return this.attendanceService.getStudentAttendance(user._id, schoolId, query)
  }

  @Get('absent-today')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD, UserRole.CLASS_TEACHER)
  @ApiOperation({ summary: 'Get all absent students today' })
  getAbsentToday(@SchoolId() schoolId: string, @Query('date') date: string) {
    return this.attendanceService.getAbsentStudentsToday(schoolId, date ? new Date(date) : undefined)
  }

  // ─── Staff Attendance ─────────────────────────────────────────────────────

  @Post('staff/clock-in')
  @ApiOperation({ summary: 'Staff clock in' })
  clockIn(@CurrentUser() user: any, @SchoolId() schoolId: string) {
    return this.attendanceService.clockIn(user._id, schoolId)
  }

  @Post('staff/clock-out')
  @ApiOperation({ summary: 'Staff clock out' })
  clockOut(@CurrentUser() user: any, @SchoolId() schoolId: string) {
    return this.attendanceService.clockOut(user._id, schoolId)
  }

  @Get('staff')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get staff attendance records' })
  getStaffAttendance(@SchoolId() schoolId: string, @Query() query: any) {
    return this.attendanceService.getStaffAttendance(schoolId, query)
  }
}

// ─── Module ───────────────────────────────────────────────────────────────────

import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Attendance.name, schema: AttendanceSchema },
      { name: StaffAttendance.name, schema: StaffAttendanceSchema },
    ]),
  ],
  controllers: [AttendanceController],
  providers: [AttendanceService],
  exports: [AttendanceService, MongooseModule],
})
export class AttendanceModule {}
