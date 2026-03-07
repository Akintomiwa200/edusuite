import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Student, StudentDocument, StudentStatus } from './schemas/student.schema'

@Injectable()
export class StudentsService {
  private readonly logger = new Logger(StudentsService.name)

  constructor(
    @InjectModel(Student.name) private studentModel: Model<StudentDocument>,
  ) {}

  // ─── Admission Number Generation ─────────────────────────────────────────

  async generateAdmissionNumber(schoolId: string, prefix?: string): Promise<string> {
    const year = new Date().getFullYear().toString().slice(-2)
    const pfx = prefix || 'STU'
    const count = await this.studentModel.countDocuments({ schoolId })
    const seq = String(count + 1).padStart(4, '0')
    return `${pfx}/${year}/${seq}`
  }

  // ─── Create ──────────────────────────────────────────────────────────────

  async createStudent(schoolId: string, branchId: string | undefined, dto: any, userId: string) {
    // Check if user already has student profile
    const existing = await this.studentModel.findOne({ userId })
    if (existing) throw new ConflictException('User already has a student profile')

    const admissionNumber = dto.admissionNumber || await this.generateAdmissionNumber(schoolId)

    const student = await this.studentModel.create({
      ...dto,
      schoolId,
      branchId,
      userId,
      admissionNumber,
      admissionDate: dto.admissionDate || new Date(),
      status: StudentStatus.ACTIVE,
      feeBalance: 0,
      totalXp: 0,
      level: 1,
      loginStreak: 0,
      parents: dto.parents || [],
      documents: [],
    })

    this.logger.log(`Created student ${admissionNumber} for school ${schoolId}`)
    return student
  }

  // ─── Read ─────────────────────────────────────────────────────────────────

  async findAll(
    schoolId: string,
    query: {
      page?: number
      limit?: number
      search?: string
      classId?: string
      status?: StudentStatus
      gender?: string
      isBoarding?: boolean
    },
  ) {
    const { page = 1, limit = 20, search, classId, status, gender, isBoarding } = query
    const filter: any = { schoolId }

    if (search) filter.$text = { $search: search }
    if (classId) filter.classId = new Types.ObjectId(classId)
    if (status) filter.status = status
    if (gender) filter.gender = gender
    if (isBoarding !== undefined) filter.isBoarding = isBoarding

    const [data, total] = await Promise.all([
      this.studentModel
        .find(filter)
        .select('-__v -documents')
        .populate('classId', 'name level section')
        .populate('userId', 'email isActive lastLogin')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ firstName: 1, lastName: 1 }),
      this.studentModel.countDocuments(filter),
    ])

    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
  }

  async findById(id: string, schoolId?: string) {
    const filter: any = { _id: id }
    if (schoolId) filter.schoolId = schoolId

    const student = await this.studentModel
      .findOne(filter)
      .populate('classId', 'name level section')
      .populate('userId', 'email isActive lastLogin profilePicture')
      .populate('hostelRoomId', 'roomNumber block')
    if (!student) throw new NotFoundException('Student not found')
    return student
  }

  async findByUserId(userId: string) {
    const student = await this.studentModel
      .findOne({ userId })
      .populate('classId', 'name level section')
    if (!student) throw new NotFoundException('Student profile not found')
    return student
  }

  async findByAdmissionNumber(schoolId: string, admissionNumber: string) {
    const student = await this.studentModel.findOne({ schoolId, admissionNumber: admissionNumber.toUpperCase() })
    if (!student) throw new NotFoundException('Student not found')
    return student
  }

  // ─── Update ──────────────────────────────────────────────────────────────

  async updateStudent(id: string, schoolId: string, dto: any) {
    const student = await this.studentModel.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: dto },
      { new: true, runValidators: true },
    )
    if (!student) throw new NotFoundException('Student not found')
    return student
  }

  async assignToClass(studentId: string, classId: string, schoolId: string) {
    const student = await this.studentModel.findOneAndUpdate(
      { _id: studentId, schoolId },
      {
        $set: { classId: new Types.ObjectId(classId) },
        ...(student => student?.classId && { $set: { previousClassId: student.classId } }),
      },
      { new: true },
    )
    if (!student) throw new NotFoundException('Student not found')
    return student
  }

  async promoteStudents(
    schoolId: string,
    promotions: Array<{ studentId: string; newClassId: string }>,
  ) {
    const results = await Promise.allSettled(
      promotions.map(({ studentId, newClassId }) =>
        this.studentModel.findOneAndUpdate(
          { _id: studentId, schoolId },
          {
            $set: { classId: new Types.ObjectId(newClassId) },
          },
          { new: true },
        ),
      ),
    )

    return {
      promoted: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    }
  }

  async addParent(studentId: string, schoolId: string, parentData: any) {
    const student = await this.studentModel.findOneAndUpdate(
      { _id: studentId, schoolId },
      { $push: { parents: parentData } },
      { new: true },
    )
    if (!student) throw new NotFoundException('Student not found')
    return student
  }

  async updateParent(studentId: string, schoolId: string, parentIndex: number, parentData: any) {
    const student = await this.studentModel.findOne({ _id: studentId, schoolId })
    if (!student) throw new NotFoundException('Student not found')
    if (parentIndex >= student.parents.length) throw new BadRequestException('Parent index out of range')

    student.parents[parentIndex] = { ...student.parents[parentIndex], ...parentData }
    return student.save()
  }

  async updateStatus(studentId: string, schoolId: string, status: StudentStatus, notes?: string) {
    const student = await this.studentModel.findOneAndUpdate(
      { _id: studentId, schoolId },
      {
        $set: {
          status,
          ...(notes && { notes }),
          ...(status === StudentStatus.GRADUATED && { graduationDate: new Date() }),
        },
      },
      { new: true },
    )
    if (!student) throw new NotFoundException('Student not found')
    return student
  }

  async updateProfilePicture(studentId: string, url: string, cloudinaryId: string) {
    return this.studentModel.findByIdAndUpdate(
      studentId,
      { $set: { profilePicture: url, cloudinaryPublicId: cloudinaryId } },
      { new: true },
    )
  }

  async addDocument(studentId: string, schoolId: string, doc: { name: string; url: string; cloudinaryId?: string }) {
    const student = await this.studentModel.findOneAndUpdate(
      { _id: studentId, schoolId },
      { $push: { documents: { ...doc, uploadedAt: new Date() } } },
      { new: true },
    )
    if (!student) throw new NotFoundException('Student not found')
    return student
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  async getStudentStats(schoolId: string) {
    const [total, byStatus, byGender, byClass, boarders] = await Promise.all([
      this.studentModel.countDocuments({ schoolId }),
      this.studentModel.aggregate([
        { $match: { schoolId: new Types.ObjectId(schoolId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      this.studentModel.aggregate([
        { $match: { schoolId: new Types.ObjectId(schoolId), status: StudentStatus.ACTIVE } },
        { $group: { _id: '$gender', count: { $sum: 1 } } },
      ]),
      this.studentModel.aggregate([
        { $match: { schoolId: new Types.ObjectId(schoolId), status: StudentStatus.ACTIVE } },
        { $group: { _id: '$currentClass', count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      this.studentModel.countDocuments({ schoolId, isBoarding: true, status: StudentStatus.ACTIVE }),
    ])

    return { total, byStatus, byGender, byClass, boarders }
  }

  async searchStudents(schoolId: string, query: string, limit = 10) {
    return this.studentModel
      .find({
        schoolId,
        status: StudentStatus.ACTIVE,
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { admissionNumber: { $regex: query, $options: 'i' } },
        ],
      })
      .select('firstName lastName admissionNumber currentClass profilePicture')
      .limit(limit)
  }

  // ─── XP / Gamification ───────────────────────────────────────────────────

  async addXp(studentId: string, xp: number, reason: string) {
    const student = await this.studentModel.findById(studentId)
    if (!student) return

    const newTotal = student.totalXp + xp
    const newLevel = this.calculateLevel(newTotal)

    await this.studentModel.findByIdAndUpdate(studentId, {
      $inc: { totalXp: xp },
      $set: { level: newLevel },
    })

    return { newTotal, newLevel, leveledUp: newLevel > student.level }
  }

  private calculateLevel(xp: number): number {
    // XP thresholds: Level n requires n^2 * 100 XP
    let level = 1
    while (level * level * 100 <= xp) level++
    return Math.min(level, 100)
  }
}
