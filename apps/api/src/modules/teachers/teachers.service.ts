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
  Teacher,
  TeacherDocument,
  TeacherStatus,
  QualificationLevel,
  EmploymentType,
} from './schemas/teacher.schema'

interface CreateTeacherDto {
  userId: string
  firstName: string
  middleName?: string
  lastName: string
  dateOfBirth: Date
  gender: string
  phone: string
  email: string
  address?: string
  employmentType?: EmploymentType
  dateOfEmployment: Date
  salaryGradeId?: string
  gradeStep?: number
  subjects?: string[]
  classes?: string[]
  qualifications?: {
    level: QualificationLevel
    institution: string
    course: string
    yearObtained: number
    grade?: string
  }[]
  nextOfKin?: {
    name: string
    phone: string
    relationship: string
    address?: string
  }
  bankDetails?: {
    bank: string
    accountNumber: string
    accountName: string
    sortCode?: string
  }
}

interface TeacherFilters {
  status?: TeacherStatus
  subjectId?: string
  classId?: string
  departmentId?: string
  employmentType?: EmploymentType
  search?: string
  page?: number
  limit?: number
}

@Injectable()
export class TeachersService {
  private readonly logger = new Logger(TeachersService.name)

  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<TeacherDocument>,
  ) {}

  // ─── Staff ID Generation ──────────────────────────────────────────────────

  async generateStaffId(schoolId: string, prefix?: string): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2)
    const pfx = prefix || 'TCH'
    const count = await this.teacherModel.countDocuments({ schoolId })
    const seq = String(count + 1).padStart(4, '0')
    return `${pfx}/${year}/${seq}`
  }

  // ─── Create ──────────────────────────────────────────────────────────────

  async create(schoolId: string, dto: CreateTeacherDto): Promise<TeacherDocument> {
    const existing = await this.teacherModel.findOne({
      schoolId: new Types.ObjectId(schoolId),
      userId: new Types.ObjectId(dto.userId),
    })
    if (existing) throw new ConflictException('User already registered as a teacher in this school')

    const staffId = await this.generateStaffId(schoolId)

    const teacher = new this.teacherModel({
      ...dto,
      schoolId: new Types.ObjectId(schoolId),
      userId: new Types.ObjectId(dto.userId),
      staffId,
      subjects: dto.subjects?.map(id => new Types.ObjectId(id)) || [],
      classes: dto.classes?.map(id => new Types.ObjectId(id)) || [],
      salaryGradeId: dto.salaryGradeId ? new Types.ObjectId(dto.salaryGradeId) : undefined,
    })

    return teacher.save()
  }

  // ─── Find All ────────────────────────────────────────────────────────────

  async findAll(
    schoolId: string,
    filters: TeacherFilters = {},
  ): Promise<{ data: TeacherDocument[]; total: number; pages: number }> {
    const { status, subjectId, classId, departmentId, employmentType, search, page = 1, limit = 20 } = filters
    const query: any = { schoolId: new Types.ObjectId(schoolId) }

    if (status) query.status = status
    if (employmentType) query.employmentType = employmentType
    if (subjectId) query.subjects = new Types.ObjectId(subjectId)
    if (classId) query.classes = new Types.ObjectId(classId)
    if (departmentId) query.departments = new Types.ObjectId(departmentId)

    if (search) {
      const regex = new RegExp(search, 'i')
      query.$or = [
        { firstName: regex },
        { lastName: regex },
        { staffId: regex },
        { email: regex },
        { phone: regex },
      ]
    }

    const [data, total] = await Promise.all([
      this.teacherModel
        .find(query)
        .populate('userId', 'email lastLogin')
        .populate('subjects', 'name code')
        .populate('formClass', 'name level')
        .sort({ firstName: 1, lastName: 1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.teacherModel.countDocuments(query),
    ])

    return { data, total, pages: Math.ceil(total / limit) }
  }

  // ─── Find One ────────────────────────────────────────────────────────────

  async findOne(schoolId: string, teacherId: string): Promise<TeacherDocument> {
    const teacher = await this.teacherModel
      .findOne({
        _id: new Types.ObjectId(teacherId),
        schoolId: new Types.ObjectId(schoolId),
      })
      .populate('userId', 'email lastLogin isActive')
      .populate('subjects', 'name code')
      .populate('classes', 'name level')
      .populate('formClass', 'name level')
      .populate('departments', 'name')
      .populate('salaryGradeId', 'name level minSalary maxSalary')

    if (!teacher) throw new NotFoundException('Teacher not found')
    return teacher
  }

  async findByUserId(userId: string): Promise<TeacherDocument | null> {
    return this.teacherModel.findOne({ userId: new Types.ObjectId(userId) })
  }

  // ─── Update ──────────────────────────────────────────────────────────────

  async update(schoolId: string, teacherId: string, dto: Partial<CreateTeacherDto>): Promise<TeacherDocument> {
    const update: any = { ...dto }
    if (dto.subjects) update.subjects = dto.subjects.map(id => new Types.ObjectId(id))
    if (dto.classes) update.classes = dto.classes.map(id => new Types.ObjectId(id))
    if (dto.salaryGradeId) update.salaryGradeId = new Types.ObjectId(dto.salaryGradeId)
    delete update.userId
    delete update.schoolId
    delete update.staffId

    const teacher = await this.teacherModel.findOneAndUpdate(
      { _id: new Types.ObjectId(teacherId), schoolId: new Types.ObjectId(schoolId) },
      { $set: update },
      { new: true },
    )
    if (!teacher) throw new NotFoundException('Teacher not found')
    return teacher
  }

  // ─── Class & Subject Assignment ──────────────────────────────────────────

  async assignToClass(schoolId: string, teacherId: string, classId: string, isFormTeacher = false): Promise<TeacherDocument> {
    const updateOp: any = { $addToSet: { classes: new Types.ObjectId(classId) } }
    if (isFormTeacher) updateOp.$set = { formClass: new Types.ObjectId(classId) }

    const teacher = await this.teacherModel.findOneAndUpdate(
      { _id: new Types.ObjectId(teacherId), schoolId: new Types.ObjectId(schoolId) },
      updateOp,
      { new: true },
    )
    if (!teacher) throw new NotFoundException('Teacher not found')
    return teacher
  }

  async removeFromClass(schoolId: string, teacherId: string, classId: string): Promise<TeacherDocument> {
    const teacher = await this.teacherModel.findOneAndUpdate(
      { _id: new Types.ObjectId(teacherId), schoolId: new Types.ObjectId(schoolId) },
      { $pull: { classes: new Types.ObjectId(classId) } },
      { new: true },
    )
    if (!teacher) throw new NotFoundException('Teacher not found')
    return teacher
  }

  async assignSubjects(schoolId: string, teacherId: string, subjectIds: string[]): Promise<TeacherDocument> {
    const teacher = await this.teacherModel.findOneAndUpdate(
      { _id: new Types.ObjectId(teacherId), schoolId: new Types.ObjectId(schoolId) },
      { $addToSet: { subjects: { $each: subjectIds.map(id => new Types.ObjectId(id)) } } },
      { new: true },
    )
    if (!teacher) throw new NotFoundException('Teacher not found')
    return teacher
  }

  // ─── Qualifications & Documents ──────────────────────────────────────────

  async addQualification(
    schoolId: string,
    teacherId: string,
    qualification: {
      level: QualificationLevel
      institution: string
      course: string
      yearObtained: number
      grade?: string
      certificate?: string
    },
  ): Promise<TeacherDocument> {
    const teacher = await this.teacherModel.findOneAndUpdate(
      { _id: new Types.ObjectId(teacherId), schoolId: new Types.ObjectId(schoolId) },
      { $push: { qualifications: qualification } },
      { new: true },
    )
    if (!teacher) throw new NotFoundException('Teacher not found')
    return teacher
  }

  async addCertification(
    schoolId: string,
    teacherId: string,
    certification: {
      name: string
      issuer: string
      dateObtained: Date
      expiryDate?: Date
      certificateUrl?: string
    },
  ): Promise<TeacherDocument> {
    const teacher = await this.teacherModel.findOneAndUpdate(
      { _id: new Types.ObjectId(teacherId), schoolId: new Types.ObjectId(schoolId) },
      { $push: { certifications: certification } },
      { new: true },
    )
    if (!teacher) throw new NotFoundException('Teacher not found')
    return teacher
  }

  // ─── Performance & Ratings ────────────────────────────────────────────────

  async updatePerformanceRating(
    schoolId: string,
    teacherId: string,
    academicYearId: string,
    rating: number,
  ): Promise<TeacherDocument> {
    if (rating < 0 || rating > 5) throw new BadRequestException('Rating must be between 0 and 5')

    const teacher = await this.teacherModel.findOne({
      _id: new Types.ObjectId(teacherId),
      schoolId: new Types.ObjectId(schoolId),
    })
    if (!teacher) throw new NotFoundException('Teacher not found')

    teacher.performanceRatings = teacher.performanceRatings || {}
    teacher.performanceRatings[academicYearId] = rating

    const ratings = Object.values(teacher.performanceRatings) as number[]
    teacher.averageRating = ratings.reduce((a, b) => a + b, 0) / ratings.length

    return teacher.save()
  }

  async addCpdPoints(schoolId: string, teacherId: string, points: number, reason: string): Promise<TeacherDocument> {
    const teacher = await this.teacherModel.findOneAndUpdate(
      { _id: new Types.ObjectId(teacherId), schoolId: new Types.ObjectId(schoolId) },
      { $inc: { cpdPoints: points } },
      { new: true },
    )
    if (!teacher) throw new NotFoundException('Teacher not found')
    this.logger.log(`Added ${points} CPD points to ${teacher.staffId} for: ${reason}`)
    return teacher
  }

  // ─── Status Management ────────────────────────────────────────────────────

  async updateStatus(schoolId: string, teacherId: string, status: TeacherStatus, reason?: string): Promise<TeacherDocument> {
    const teacher = await this.teacherModel.findOneAndUpdate(
      { _id: new Types.ObjectId(teacherId), schoolId: new Types.ObjectId(schoolId) },
      { $set: { status } },
      { new: true },
    )
    if (!teacher) throw new NotFoundException('Teacher not found')
    this.logger.log(`Teacher ${teacher.staffId} status updated to ${status}${reason ? ': ' + reason : ''}`)
    return teacher
  }

  // ─── Analytics ───────────────────────────────────────────────────────────

  async getTeacherStats(schoolId: string): Promise<Record<string, unknown>> {
    const [byStatus, byEmployment, byGender, avgRating, topRated] = await Promise.all([
      this.teacherModel.aggregate([
        { $match: { schoolId: new Types.ObjectId(schoolId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.teacherModel.aggregate([
        { $match: { schoolId: new Types.ObjectId(schoolId) } },
        { $group: { _id: '$employmentType', count: { $sum: 1 } } },
      ]),
      this.teacherModel.aggregate([
        { $match: { schoolId: new Types.ObjectId(schoolId) } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
      this.teacherModel.aggregate([
        { $match: { schoolId: new Types.ObjectId(schoolId), averageRating: { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$averageRating' } } },
      ]),
      this.teacherModel
        .find({ schoolId: new Types.ObjectId(schoolId), averageRating: { $gt: 0 } })
        .sort({ averageRating: -1 })
        .limit(5)
        .select('firstName lastName staffId averageRating'),
    ])

    return { byStatus, byEmployment, byGender, avgRating: avgRating[0]?.avg || 0, topRated }
  }

  async getWorkload(schoolId: string, teacherId: string): Promise<Record<string, unknown>> {
    const teacher = await this.findOne(schoolId, teacherId)
    return {
      totalSubjects: teacher.subjects.length,
      totalClasses: teacher.classes.length,
      isFormTeacher: !!teacher.formClass,
      formClass: teacher.formClass,
      cpdPoints: teacher.cpdPoints,
      averageRating: teacher.averageRating,
    }
  }

  async getExpiringCertifications(schoolId: string, daysAhead = 30): Promise<TeacherDocument[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + daysAhead)

    return this.teacherModel.find({
      schoolId: new Types.ObjectId(schoolId),
      'certifications.expiryDate': { $lte: futureDate, $gte: new Date() },
    })
  }

  // ─── Bank Details ─────────────────────────────────────────────────────────

  async updateBankDetails(
    schoolId: string,
    teacherId: string,
    bankDetails: { bank: string; accountNumber: string; accountName: string; sortCode?: string },
  ): Promise<TeacherDocument> {
    const teacher = await this.teacherModel.findOneAndUpdate(
      { _id: new Types.ObjectId(teacherId), schoolId: new Types.ObjectId(schoolId) },
      { $set: { bankDetails } },
      { new: true },
    )
    if (!teacher) throw new NotFoundException('Teacher not found')
    return teacher
  }

  async remove(schoolId: string, teacherId: string): Promise<void> {
    const result = await this.teacherModel.findOneAndDelete({
      _id: new Types.ObjectId(teacherId),
      schoolId: new Types.ObjectId(schoolId),
    })
    if (!result) throw new NotFoundException('Teacher not found')
  }
}
