import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import {
  AcademicYear,
  AcademicYearDocument,
  Subject,
  SubjectDocument,
  ClassRoom,
  ClassRoomDocument,
  Timetable,
  TimetableDocument,
  DayOfWeek,
} from './schemas/academic.schema'

@Injectable()
export class AcademicService {
  private readonly logger = new Logger(AcademicService.name)

  constructor(
    @InjectModel(AcademicYear.name) private yearModel: Model<AcademicYearDocument>,
    @InjectModel(Subject.name) private subjectModel: Model<SubjectDocument>,
    @InjectModel(ClassRoom.name) private classModel: Model<ClassRoomDocument>,
    @InjectModel(Timetable.name) private timetableModel: Model<TimetableDocument>,
  ) {}

  // ─── Academic Years ───────────────────────────────────────────────────────

  async createAcademicYear(schoolId: string, dto: {
    name: string
    startDate: Date
    endDate: Date
    terms?: Array<{ name: string; number: 1 | 2 | 3; startDate: Date; endDate: Date }>
  }) {
    const existing = await this.yearModel.findOne({ schoolId, name: dto.name })
    if (existing) throw new ConflictException(`Academic year '${dto.name}' already exists`)

    // Default 3 terms if not provided
    const terms = dto.terms || this.generateDefaultTerms(dto.startDate, dto.endDate, dto.name)

    return this.yearModel.create({ ...dto, schoolId, terms })
  }

  private generateDefaultTerms(start: Date, end: Date, yearName: string) {
    const total = new Date(end).getTime() - new Date(start).getTime()
    const third = total / 3

    return [1, 2, 3].map((n) => ({
      name: `${yearName} - Term ${n}`,
      number: n as 1 | 2 | 3,
      startDate: new Date(new Date(start).getTime() + (n - 1) * third),
      endDate: new Date(new Date(start).getTime() + n * third),
      isActive: n === 1,
    }))
  }

  async setCurrentAcademicYear(schoolId: string, yearId: string) {
    // Unset all current
    await this.yearModel.updateMany({ schoolId }, { $set: { isCurrent: false } })
    const year = await this.yearModel.findByIdAndUpdate(yearId, { $set: { isCurrent: true } }, { new: true })
    if (!year) throw new NotFoundException('Academic year not found')
    return year
  }

  async getAcademicYears(schoolId: string) {
    return this.yearModel.find({ schoolId }).sort({ createdAt: -1 })
  }

  async getCurrentAcademicYear(schoolId: string) {
    const year = await this.yearModel.findOne({ schoolId, isCurrent: true })
    if (!year) throw new NotFoundException('No current academic year set')
    return year
  }

  async activateTerm(schoolId: string, yearId: string, termNumber: 1 | 2 | 3) {
    const year = await this.yearModel.findOne({ _id: yearId, schoolId })
    if (!year) throw new NotFoundException('Academic year not found')

    year.terms = year.terms.map((t) => ({ ...t, isActive: t.number === termNumber }))
    return year.save()
  }

  // ─── Subjects ─────────────────────────────────────────────────────────────

  async createSubject(schoolId: string, dto: any) {
    const existing = await this.subjectModel.findOne({ schoolId, code: dto.code?.toUpperCase() })
    if (existing) throw new ConflictException(`Subject with code '${dto.code}' already exists`)

    return this.subjectModel.create({ ...dto, schoolId, code: dto.code?.toUpperCase() })
  }

  async getSubjects(schoolId: string, query: { category?: string; level?: string } = {}) {
    const filter: any = { schoolId, isActive: true }
    if (query.category) filter.category = query.category
    if (query.level) filter.applicableLevels = query.level

    return this.subjectModel.find(filter).sort({ name: 1 })
  }

  async updateSubject(id: string, schoolId: string, dto: any) {
    const subject = await this.subjectModel.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: dto },
      { new: true },
    )
    if (!subject) throw new NotFoundException('Subject not found')
    return subject
  }

  // ─── Classes ─────────────────────────────────────────────────────────────

  async createClass(schoolId: string, dto: any) {
    const existing = await this.classModel.findOne({
      schoolId,
      name: dto.name,
      academicYearId: dto.academicYearId,
    })
    if (existing) throw new ConflictException(`Class '${dto.name}' already exists for this academic year`)

    return this.classModel.create({ ...dto, schoolId })
  }

  async getClasses(schoolId: string, academicYearId?: string) {
    const filter: any = { schoolId, isActive: true }
    if (academicYearId) filter.academicYearId = new Types.ObjectId(academicYearId)

    return this.classModel
      .find(filter)
      .populate('classTeacherId', 'firstName lastName profilePicture')
      .populate('subjects.subjectId', 'name code color')
      .populate('subjects.teacherId', 'firstName lastName')
      .sort({ level: 1, section: 1 })
  }

  async getClassById(id: string, schoolId: string) {
    const cls = await this.classModel
      .findOne({ _id: id, schoolId })
      .populate('classTeacherId', 'firstName lastName email')
      .populate('subjects.subjectId', 'name code color creditUnits')
      .populate('subjects.teacherId', 'firstName lastName email')
    if (!cls) throw new NotFoundException('Class not found')
    return cls
  }

  async updateClass(id: string, schoolId: string, dto: any) {
    const cls = await this.classModel.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: dto },
      { new: true },
    )
    if (!cls) throw new NotFoundException('Class not found')
    return cls
  }

  async assignSubjectToClass(classId: string, schoolId: string, subjectData: {
    subjectId: string
    teacherId?: string
    hoursPerWeek?: number
  }) {
    const cls = await this.classModel.findOne({ _id: classId, schoolId })
    if (!cls) throw new NotFoundException('Class not found')

    const existingIndex = cls.subjects.findIndex(
      (s) => s.subjectId.toString() === subjectData.subjectId,
    )

    if (existingIndex >= 0) {
      cls.subjects[existingIndex] = {
        subjectId: new Types.ObjectId(subjectData.subjectId),
        teacherId: subjectData.teacherId ? new Types.ObjectId(subjectData.teacherId) : undefined,
        hoursPerWeek: subjectData.hoursPerWeek || 3,
      }
    } else {
      cls.subjects.push({
        subjectId: new Types.ObjectId(subjectData.subjectId),
        teacherId: subjectData.teacherId ? new Types.ObjectId(subjectData.teacherId) : undefined,
        hoursPerWeek: subjectData.hoursPerWeek || 3,
      })
    }

    return cls.save()
  }

  async getTeacherClasses(teacherId: string, schoolId: string) {
    return this.classModel
      .find({ schoolId, 'subjects.teacherId': new Types.ObjectId(teacherId), isActive: true })
      .select('name level section capacity')
  }

  // ─── Timetable ────────────────────────────────────────────────────────────

  async createTimetableSlot(schoolId: string, dto: any) {
    // Check teacher availability
    const teacherConflict = await this.timetableModel.findOne({
      schoolId,
      teacherId: dto.teacherId,
      day: dto.day,
      $or: [
        { startTime: { $lt: dto.endTime, $gte: dto.startTime } },
        { endTime: { $gt: dto.startTime, $lte: dto.endTime } },
      ],
    })
    if (teacherConflict) throw new ConflictException('Teacher has a scheduling conflict at this time')

    // Check class availability
    const classConflict = await this.timetableModel.findOne({
      schoolId,
      classId: dto.classId,
      day: dto.day,
      $or: [
        { startTime: { $lt: dto.endTime, $gte: dto.startTime } },
        { endTime: { $gt: dto.startTime, $lte: dto.endTime } },
      ],
    })
    if (classConflict) throw new ConflictException('Class already has a lesson at this time')

    return this.timetableModel.create({ ...dto, schoolId })
  }

  async getClassTimetable(classId: string, schoolId: string, academicYearId?: string) {
    const filter: any = { classId: new Types.ObjectId(classId), schoolId }
    if (academicYearId) filter.academicYearId = new Types.ObjectId(academicYearId)

    const slots = await this.timetableModel
      .find(filter)
      .populate('subjectId', 'name code color')
      .populate('teacherId', 'firstName lastName')
      .sort({ day: 1, startTime: 1 })

    // Group by day
    const grouped: Record<string, any[]> = {}
    for (const day of Object.values(DayOfWeek)) {
      grouped[day] = slots.filter((s) => s.day === day)
    }

    return grouped
  }

  async getTeacherTimetable(teacherId: string, schoolId: string) {
    const slots = await this.timetableModel
      .find({ teacherId: new Types.ObjectId(teacherId), schoolId })
      .populate('subjectId', 'name code color')
      .populate('classId', 'name level section')
      .sort({ day: 1, startTime: 1 })

    const grouped: Record<string, any[]> = {}
    for (const day of Object.values(DayOfWeek)) {
      grouped[day] = slots.filter((s) => s.day === day)
    }

    return grouped
  }

  async deleteTimetableSlot(slotId: string, schoolId: string) {
    const slot = await this.timetableModel.findOneAndDelete({ _id: slotId, schoolId })
    if (!slot) throw new NotFoundException('Timetable slot not found')
    return { message: 'Slot deleted successfully' }
  }

  async bulkCreateTimetable(schoolId: string, slots: any[]) {
    // Delete existing slots for the class
    if (slots.length > 0) {
      await this.timetableModel.deleteMany({
        schoolId,
        classId: slots[0].classId,
        academicYearId: slots[0].academicYearId,
      })
    }

    const created = await this.timetableModel.insertMany(
      slots.map((s) => ({ ...s, schoolId })),
    )
    return { created: created.length }
  }
}
