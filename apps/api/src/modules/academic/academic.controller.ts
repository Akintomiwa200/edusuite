import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AcademicService } from './academic.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles, CurrentUser, SchoolId } from '../../common/decorators/roles.decorator'
import { UserRole } from '@edusuite/shared-types'

@ApiTags('Academic')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('academic')
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  // ─── Academic Years ───────────────────────────────────────────────────────

  @Post('years')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  createYear(@SchoolId() schoolId: string, @Body() dto: any) {
    return this.academicService.createAcademicYear(schoolId, dto)
  }

  @Get('years')
  getYears(@SchoolId() schoolId: string) {
    return this.academicService.getAcademicYears(schoolId)
  }

  @Get('years/current')
  getCurrentYear(@SchoolId() schoolId: string) {
    return this.academicService.getCurrentAcademicYear(schoolId)
  }

  @Patch('years/:id/set-current')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  setCurrentYear(@Param('id') id: string, @SchoolId() schoolId: string) {
    return this.academicService.setCurrentAcademicYear(schoolId, id)
  }

  @Patch('years/:id/terms/:termNumber/activate')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  activateTerm(
    @Param('id') yearId: string,
    @Param('termNumber') termNumber: number,
    @SchoolId() schoolId: string,
  ) {
    return this.academicService.activateTerm(schoolId, yearId, termNumber as 1 | 2 | 3)
  }

  // ─── Subjects ─────────────────────────────────────────────────────────────

  @Post('subjects')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  createSubject(@SchoolId() schoolId: string, @Body() dto: any) {
    return this.academicService.createSubject(schoolId, dto)
  }

  @Get('subjects')
  getSubjects(@SchoolId() schoolId: string, @Query() query: any) {
    return this.academicService.getSubjects(schoolId, query)
  }

  @Put('subjects/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  updateSubject(@Param('id') id: string, @SchoolId() schoolId: string, @Body() dto: any) {
    return this.academicService.updateSubject(id, schoolId, dto)
  }

  // ─── Classes ─────────────────────────────────────────────────────────────

  @Post('classes')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  createClass(@SchoolId() schoolId: string, @Body() dto: any) {
    return this.academicService.createClass(schoolId, dto)
  }

  @Get('classes')
  getClasses(@SchoolId() schoolId: string, @Query('academicYearId') yearId: string) {
    return this.academicService.getClasses(schoolId, yearId)
  }

  @Get('classes/:id')
  getClass(@Param('id') id: string, @SchoolId() schoolId: string) {
    return this.academicService.getClassById(id, schoolId)
  }

  @Put('classes/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  updateClass(@Param('id') id: string, @SchoolId() schoolId: string, @Body() dto: any) {
    return this.academicService.updateClass(id, schoolId, dto)
  }

  @Post('classes/:id/subjects')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  assignSubject(
    @Param('id') classId: string,
    @SchoolId() schoolId: string,
    @Body() dto: { subjectId: string; teacherId?: string; hoursPerWeek?: number },
  ) {
    return this.academicService.assignSubjectToClass(classId, schoolId, dto)
  }

  @Get('teacher/classes')
  @Roles(UserRole.TEACHER, UserRole.CLASS_TEACHER)
  getMyClasses(@CurrentUser() user: any, @SchoolId() schoolId: string) {
    return this.academicService.getTeacherClasses(user._id, schoolId)
  }

  // ─── Timetable ────────────────────────────────────────────────────────────

  @Post('timetable')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  createTimetableSlot(@SchoolId() schoolId: string, @Body() dto: any) {
    return this.academicService.createTimetableSlot(schoolId, dto)
  }

  @Post('timetable/bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  bulkCreateTimetable(@SchoolId() schoolId: string, @Body() body: { slots: any[] }) {
    return this.academicService.bulkCreateTimetable(schoolId, body.slots)
  }

  @Get('timetable/class/:classId')
  getClassTimetable(
    @Param('classId') classId: string,
    @SchoolId() schoolId: string,
    @Query('academicYearId') yearId: string,
  ) {
    return this.academicService.getClassTimetable(classId, schoolId, yearId)
  }

  @Get('timetable/teacher')
  @Roles(UserRole.TEACHER, UserRole.CLASS_TEACHER)
  getMyTimetable(@CurrentUser() user: any, @SchoolId() schoolId: string) {
    return this.academicService.getTeacherTimetable(user._id, schoolId)
  }

  @Get('timetable/teacher/:teacherId')
  getTeacherTimetable(@Param('teacherId') teacherId: string, @SchoolId() schoolId: string) {
    return this.academicService.getTeacherTimetable(teacherId, schoolId)
  }

  @Delete('timetable/:slotId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  deleteTimetableSlot(@Param('slotId') slotId: string, @SchoolId() schoolId: string) {
    return this.academicService.deleteTimetableSlot(slotId, schoolId)
  }
}
