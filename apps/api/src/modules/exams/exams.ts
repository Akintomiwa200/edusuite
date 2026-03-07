import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { Injectable, NotFoundException, BadRequestException, Logger, Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards, Module } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { MongooseModule } from '@nestjs/mongoose'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles, CurrentUser, SchoolId } from '../../common/decorators/roles.decorator'
import { UserRole } from '@edusuite/shared-types'

// ─── Schema ───────────────────────────────────────────────────────────────────

export type ExamDocument = Exam & Document
export type ExamScoreDocument = ExamScore & Document
export type ReportCardDocument = ReportCard & Document

export enum ExamType {
  CA = 'continuous_assessment', MID_TERM = 'mid_term', TERMINAL = 'terminal',
  MOCK = 'mock', ENTRANCE = 'entrance', PRACTICAL = 'practical',
}

export enum ExamStatus {
  DRAFT = 'draft', SCHEDULED = 'scheduled', IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed', RESULTS_PUBLISHED = 'results_published', CANCELLED = 'cancelled',
}

@Schema({ timestamps: true, collection: 'exams' })
export class Exam {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ required: true, trim: true })
  name: string

  @Prop({ enum: Object.values(ExamType), required: true })
  type: ExamType

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear', required: true })
  academicYearId: Types.ObjectId

  @Prop({ type: Number, enum: [1, 2, 3], required: true })
  termNumber: 1 | 2 | 3

  @Prop({ required: true })
  startDate: Date

  @Prop({ required: true })
  endDate: Date

  @Prop({ type: [String] }) // e.g. ["JSS 1", "JSS 2"]
  applicableLevels: string[]

  @Prop({ type: Types.ObjectId, ref: 'ClassRoom' })
  classId?: Types.ObjectId // null = all applicable levels

  @Prop({
    type: [{
      subjectId: { type: Types.ObjectId, ref: 'Subject' },
      totalMarks: { type: Number, default: 100 },
      passMark: { type: Number, default: 40 },
      date: Date,
      startTime: String,
      duration: Number, // minutes
      venue: String,
      invigilators: [{ type: Types.ObjectId, ref: 'User' }],
    }],
  })
  subjects: Array<{
    subjectId: Types.ObjectId
    totalMarks: number
    passMark: number
    date?: Date
    startTime?: string
    duration?: number
    venue?: string
    invigilators: Types.ObjectId[]
  }>

  @Prop({ enum: Object.values(ExamStatus), default: ExamStatus.DRAFT, index: true })
  status: ExamStatus

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId

  @Prop({ default: false })
  resultsPublished: boolean

  @Prop({ trim: true })
  instructions?: string
}

export const ExamSchema = SchemaFactory.createForClass(Exam)
ExamSchema.index({ schoolId: 1, academicYearId: 1, termNumber: 1, type: 1 })

@Schema({ timestamps: true, collection: 'exam_scores' })
export class ExamScore {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Subject', required: true })
  subjectId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'ClassRoom', required: true })
  classId: Types.ObjectId

  @Prop({ required: true, min: 0 })
  score: number

  @Prop({ required: true })
  totalMarks: number

  @Prop({ required: true })
  passMark: number

  @Prop()
  grade?: string // A, B, C, D, F

  @Prop()
  gradePoint?: number // for GPA

  @Prop()
  position?: number // class position for this subject

  @Prop()
  comment?: string // teacher's comment

  @Prop({ type: Types.ObjectId, ref: 'User' })
  enteredBy: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User' })
  verifiedBy?: Types.ObjectId

  @Prop({ default: false })
  isAbsent: boolean
}

export const ExamScoreSchema = SchemaFactory.createForClass(ExamScore)
ExamScoreSchema.index({ examId: 1, studentId: 1, subjectId: 1 }, { unique: true })
ExamScoreSchema.index({ schoolId: 1, studentId: 1 })

@Schema({ timestamps: true, collection: 'report_cards' })
export class ReportCard {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'ClassRoom', required: true })
  classId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear', required: true })
  academicYearId: Types.ObjectId

  @Prop({ type: Number, enum: [1, 2, 3] })
  termNumber?: 1 | 2 | 3

  @Prop({
    type: [{
      subjectId: { type: Types.ObjectId, ref: 'Subject' },
      subjectName: String,
      caScore: Number, // Continuous Assessment
      examScore: Number, // Terminal exam
      totalScore: Number,
      totalMarks: Number,
      grade: String,
      gradePoint: Number,
      position: Number,
      teacherComment: String,
    }],
  })
  results: Array<{
    subjectId: Types.ObjectId
    subjectName: string
    caScore: number
    examScore: number
    totalScore: number
    totalMarks: number
    grade?: string
    gradePoint?: number
    position?: number
    teacherComment?: string
  }>

  @Prop({ default: 0 })
  totalScore: number

  @Prop({ default: 0 })
  totalObtainable: number

  @Prop({ default: 0 })
  average: number

  @Prop()
  gpa?: number

  @Prop()
  classPosition?: number // position in class

  @Prop()
  totalStudentsInClass?: number

  @Prop({ default: 'Good' })
  principalComment?: string

  @Prop()
  classTeacherComment?: string

  @Prop({ default: false })
  isPublished: boolean

  @Prop()
  publishedAt?: Date

  @Prop({ default: 0 })
  viewCount: number
}

export const ReportCardSchema = SchemaFactory.createForClass(ReportCard)
ReportCardSchema.index({ schoolId: 1, studentId: 1, academicYearId: 1, termNumber: 1 }, { unique: true })

// ─── Grade Calculator ─────────────────────────────────────────────────────────

function calculateGrade(score: number, total: number): { grade: string; gradePoint: number } {
  const percentage = (score / total) * 100
  if (percentage >= 70) return { grade: 'A', gradePoint: 4.0 }
  if (percentage >= 60) return { grade: 'B', gradePoint: 3.0 }
  if (percentage >= 50) return { grade: 'C', gradePoint: 2.0 }
  if (percentage >= 45) return { grade: 'D', gradePoint: 1.0 }
  if (percentage >= 40) return { grade: 'E', gradePoint: 0.5 }
  return { grade: 'F', gradePoint: 0.0 }
}

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class ExamsService {
  private readonly logger = new Logger(ExamsService.name)

  constructor(
    @InjectModel(Exam.name) private examModel: Model<ExamDocument>,
    @InjectModel(ExamScore.name) private scoreModel: Model<ExamScoreDocument>,
    @InjectModel(ReportCard.name) private reportCardModel: Model<ReportCardDocument>,
  ) {}

  async createExam(schoolId: string, dto: any, createdBy: string) {
    return this.examModel.create({ ...dto, schoolId, createdBy: new Types.ObjectId(createdBy), status: ExamStatus.DRAFT })
  }

  async getExams(schoolId: string, query: any) {
    const filter: any = { schoolId }
    if (query.academicYearId) filter.academicYearId = new Types.ObjectId(query.academicYearId)
    if (query.termNumber) filter.termNumber = query.termNumber
    if (query.type) filter.type = query.type
    if (query.status) filter.status = query.status

    return this.examModel.find(filter).populate('subjects.subjectId', 'name code').sort({ startDate: -1 })
  }

  async updateExamStatus(examId: string, schoolId: string, status: ExamStatus, approvedBy?: string) {
    const exam = await this.examModel.findOneAndUpdate(
      { _id: examId, schoolId },
      { $set: { status, ...(approvedBy && { approvedBy: new Types.ObjectId(approvedBy) }) } },
      { new: true },
    )
    if (!exam) throw new NotFoundException('Exam not found')
    return exam
  }

  async enterScores(schoolId: string, examId: string, dto: {
    scores: Array<{ studentId: string; subjectId: string; classId: string; score: number; isAbsent?: boolean; comment?: string }>
    enteredBy: string
  }) {
    const exam = await this.examModel.findOne({ _id: examId, schoolId })
    if (!exam) throw new NotFoundException('Exam not found')
    if (exam.status === ExamStatus.RESULTS_PUBLISHED) throw new BadRequestException('Cannot modify published results')

    const results = await Promise.allSettled(
      dto.scores.map((s) => {
        const subjectConfig = exam.subjects.find((sub) => sub.subjectId.toString() === s.subjectId)
        const totalMarks = subjectConfig?.totalMarks || 100
        const passMark = subjectConfig?.passMark || 40
        const { grade, gradePoint } = calculateGrade(s.score, totalMarks)

        return this.scoreModel.findOneAndUpdate(
          {
            examId: new Types.ObjectId(examId),
            studentId: new Types.ObjectId(s.studentId),
            subjectId: new Types.ObjectId(s.subjectId),
          },
          {
            $set: {
              schoolId,
              classId: new Types.ObjectId(s.classId),
              score: s.isAbsent ? 0 : s.score,
              totalMarks,
              passMark,
              grade: s.isAbsent ? 'ABS' : grade,
              gradePoint: s.isAbsent ? 0 : gradePoint,
              isAbsent: s.isAbsent || false,
              comment: s.comment,
              enteredBy: new Types.ObjectId(dto.enteredBy),
            },
          },
          { upsert: true, new: true },
        )
      }),
    )

    return {
      saved: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    }
  }

  async getExamScores(examId: string, schoolId: string, classId?: string) {
    const filter: any = { examId: new Types.ObjectId(examId), schoolId }
    if (classId) filter.classId = new Types.ObjectId(classId)

    return this.scoreModel
      .find(filter)
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('subjectId', 'name code')
  }

  async generateReportCards(schoolId: string, dto: {
    academicYearId: string
    termNumber: 1 | 2 | 3
    classId: string
    examIds: string[] // CA exam and terminal exam IDs
  }) {
    // Aggregate scores from all exams
    const allScores = await this.scoreModel.find({
      schoolId,
      examId: { $in: dto.examIds.map((id) => new Types.ObjectId(id)) },
      classId: new Types.ObjectId(dto.classId),
    }).populate('subjectId', 'name')

    // Group by student
    const studentScores: Record<string, any[]> = {}
    for (const score of allScores) {
      const sid = score.studentId.toString()
      if (!studentScores[sid]) studentScores[sid] = []
      studentScores[sid].push(score)
    }

    // Calculate positions per subject
    const subjectScoreMap: Record<string, number[]> = {}
    for (const scores of Object.values(studentScores)) {
      for (const s of scores) {
        const subId = s.subjectId._id.toString()
        if (!subjectScoreMap[subId]) subjectScoreMap[subId] = []
        subjectScoreMap[subId].push(s.score)
      }
    }

    const reportCards = []
    for (const [studentId, scores] of Object.entries(studentScores)) {
      const subjectResults = scores.map((s) => {
        const subScores = subjectScoreMap[s.subjectId._id.toString()] || []
        const sortedDesc = [...subScores].sort((a, b) => b - a)
        const position = sortedDesc.indexOf(s.score) + 1

        return {
          subjectId: s.subjectId._id,
          subjectName: s.subjectId.name,
          caScore: 0,
          examScore: s.score,
          totalScore: s.score,
          totalMarks: s.totalMarks,
          grade: s.grade,
          gradePoint: s.gradePoint,
          position,
          teacherComment: s.comment,
        }
      })

      const totalScore = subjectResults.reduce((sum, r) => sum + r.totalScore, 0)
      const totalObtainable = subjectResults.reduce((sum, r) => sum + r.totalMarks, 0)
      const average = totalObtainable > 0 ? (totalScore / totalObtainable) * 100 : 0

      const card = await this.reportCardModel.findOneAndUpdate(
        {
          schoolId,
          studentId: new Types.ObjectId(studentId),
          academicYearId: new Types.ObjectId(dto.academicYearId),
          termNumber: dto.termNumber,
        },
        {
          $set: {
            classId: new Types.ObjectId(dto.classId),
            results: subjectResults,
            totalScore,
            totalObtainable,
            average: Math.round(average * 100) / 100,
          },
        },
        { upsert: true, new: true },
      )
      reportCards.push(card)
    }

    // Calculate class positions
    reportCards.sort((a, b) => b.totalScore - a.totalScore)
    for (let i = 0; i < reportCards.length; i++) {
      await this.reportCardModel.findByIdAndUpdate(reportCards[i]._id, {
        $set: { classPosition: i + 1, totalStudentsInClass: reportCards.length },
      })
    }

    return { generated: reportCards.length }
  }

  async publishReportCards(schoolId: string, academicYearId: string, termNumber: number, classId?: string) {
    const filter: any = { schoolId, academicYearId: new Types.ObjectId(academicYearId), termNumber }
    if (classId) filter.classId = new Types.ObjectId(classId)

    const result = await this.reportCardModel.updateMany(filter, {
      $set: { isPublished: true, publishedAt: new Date() },
    })
    return { published: result.modifiedCount }
  }

  async getStudentReportCard(studentId: string, schoolId: string, academicYearId: string, termNumber: number) {
    const card = await this.reportCardModel
      .findOne({
        studentId: new Types.ObjectId(studentId),
        schoolId,
        academicYearId: new Types.ObjectId(academicYearId),
        termNumber,
      })
      .populate('studentId', 'firstName lastName admissionNumber currentClass gender')
      .populate('classId', 'name level')
      .populate('academicYearId', 'name')
      .populate('results.subjectId', 'name code')

    if (!card) throw new NotFoundException('Report card not found')

    // Increment view count
    await this.reportCardModel.findByIdAndUpdate(card._id, { $inc: { viewCount: 1 } })

    return card
  }
}

// ─── Controller ────────────────────────────────────────────────────────────────

@ApiTags('Exams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('exams')
export class ExamsController {
  constructor(private readonly examsService: ExamsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  createExam(@SchoolId() schoolId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.examsService.createExam(schoolId, dto, user._id)
  }

  @Get()
  getExams(@SchoolId() schoolId: string, @Query() query: any) {
    return this.examsService.getExams(schoolId, query)
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  updateStatus(@Param('id') id: string, @SchoolId() schoolId: string, @Body() body: { status: ExamStatus }, @CurrentUser() user: any) {
    return this.examsService.updateExamStatus(id, schoolId, body.status, user._id)
  }

  @Post(':id/scores')
  @Roles(UserRole.TEACHER, UserRole.CLASS_TEACHER, UserRole.ACADEMIC_HEAD, UserRole.SCHOOL_ADMIN)
  enterScores(@Param('id') examId: string, @SchoolId() schoolId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.examsService.enterScores(schoolId, examId, { ...dto, enteredBy: user._id })
  }

  @Get(':id/scores')
  getScores(@Param('id') examId: string, @SchoolId() schoolId: string, @Query('classId') classId: string) {
    return this.examsService.getExamScores(examId, schoolId, classId)
  }

  @Post('report-cards/generate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  generateReportCards(@SchoolId() schoolId: string, @Body() dto: any) {
    return this.examsService.generateReportCards(schoolId, dto)
  }

  @Post('report-cards/publish')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  publishReportCards(@SchoolId() schoolId: string, @Body() body: { academicYearId: string; termNumber: number; classId?: string }) {
    return this.examsService.publishReportCards(schoolId, body.academicYearId, body.termNumber, body.classId)
  }

  @Get('report-cards/student/:studentId')
  getStudentReportCard(
    @Param('studentId') studentId: string,
    @SchoolId() schoolId: string,
    @Query('academicYearId') yearId: string,
    @Query('termNumber') termNumber: number,
  ) {
    return this.examsService.getStudentReportCard(studentId, schoolId, yearId, termNumber)
  }

  @Get('report-cards/mine')
  @Roles(UserRole.STUDENT)
  getMyReportCards(@CurrentUser() user: any, @SchoolId() schoolId: string, @Query('academicYearId') yearId: string, @Query('termNumber') termNumber: number) {
    return this.examsService.getStudentReportCard(user._id, schoolId, yearId, termNumber)
  }
}

// ─── Module ───────────────────────────────────────────────────────────────────

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Exam.name, schema: ExamSchema },
      { name: ExamScore.name, schema: ExamScoreSchema },
      { name: ReportCard.name, schema: ReportCardSchema },
    ]),
  ],
  controllers: [ExamsController],
  providers: [ExamsService],
  exports: [ExamsService, MongooseModule],
})
export class ExamsModule {}
