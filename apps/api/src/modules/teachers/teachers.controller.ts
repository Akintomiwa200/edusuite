import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { TeachersService } from './teachers.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles, SchoolId } from '../../common/decorators/roles.decorator'
import { UserRole } from '@edusuite/shared-types'
import { TeacherStatus, QualificationLevel, EmploymentType } from './schemas/teacher.schema'

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Register a new teacher' })
  create(@SchoolId() schoolId: string, @Body() dto: any) {
    return this.teachersService.create(schoolId, dto)
  }

  @Get()
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD, UserRole.HR_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get all teachers with filters' })
  @ApiQuery({ name: 'status', enum: TeacherStatus, required: false })
  @ApiQuery({ name: 'employmentType', enum: EmploymentType, required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  findAll(
    @SchoolId() schoolId: string,
    @Query('status') status?: TeacherStatus,
    @Query('employmentType') employmentType?: EmploymentType,
    @Query('subjectId') subjectId?: string,
    @Query('classId') classId?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.teachersService.findAll(schoolId, { status, employmentType, subjectId, classId, search, page, limit })
  }

  @Get('stats')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD, UserRole.HR_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get teacher statistics' })
  getStats(@SchoolId() schoolId: string) {
    return this.teachersService.getTeacherStats(schoolId)
  }

  @Get('expiring-certifications')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Get teachers with soon-expiring certifications' })
  getExpiring(@SchoolId() schoolId: string, @Query('days') days?: number) {
    return this.teachersService.getExpiringCertifications(schoolId, days)
  }

  @Get(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD, UserRole.HR_ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get teacher by ID' })
  findOne(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.teachersService.findOne(schoolId, id)
  }

  @Get(':id/workload')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD, UserRole.HR_ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get teacher workload summary' })
  getWorkload(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.teachersService.getWorkload(schoolId, id)
  }

  @Put(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update teacher profile' })
  update(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: any) {
    return this.teachersService.update(schoolId, id, dto)
  }

  @Patch(':id/status')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update teacher status' })
  updateStatus(
    @SchoolId() schoolId: string,
    @Param('id') id: string,
    @Body() body: { status: TeacherStatus; reason?: string },
  ) {
    return this.teachersService.updateStatus(schoolId, id, body.status, body.reason)
  }

  @Post(':id/classes')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Assign teacher to class' })
  assignToClass(
    @SchoolId() schoolId: string,
    @Param('id') id: string,
    @Body() body: { classId: string; isFormTeacher?: boolean },
  ) {
    return this.teachersService.assignToClass(schoolId, id, body.classId, body.isFormTeacher)
  }

  @Delete(':id/classes/:classId')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Remove teacher from class' })
  removeFromClass(@SchoolId() schoolId: string, @Param('id') id: string, @Param('classId') classId: string) {
    return this.teachersService.removeFromClass(schoolId, id, classId)
  }

  @Post(':id/subjects')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Assign subjects to teacher' })
  assignSubjects(@SchoolId() schoolId: string, @Param('id') id: string, @Body() body: { subjectIds: string[] }) {
    return this.teachersService.assignSubjects(schoolId, id, body.subjectIds)
  }

  @Post(':id/qualifications')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add qualification to teacher profile' })
  addQualification(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: any) {
    return this.teachersService.addQualification(schoolId, id, dto)
  }

  @Post(':id/certifications')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add certification to teacher profile' })
  addCertification(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: any) {
    return this.teachersService.addCertification(schoolId, id, dto)
  }

  @Patch(':id/performance-rating')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update teacher performance rating' })
  updateRating(
    @SchoolId() schoolId: string,
    @Param('id') id: string,
    @Body() body: { academicYearId: string; rating: number },
  ) {
    return this.teachersService.updatePerformanceRating(schoolId, id, body.academicYearId, body.rating)
  }

  @Patch(':id/cpd-points')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Add CPD points to teacher' })
  addCpdPoints(@SchoolId() schoolId: string, @Param('id') id: string, @Body() body: { points: number; reason: string }) {
    return this.teachersService.addCpdPoints(schoolId, id, body.points, body.reason)
  }

  @Patch(':id/bank-details')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update teacher bank details' })
  updateBankDetails(@SchoolId() schoolId: string, @Param('id') id: string, @Body() dto: any) {
    return this.teachersService.updateBankDetails(schoolId, id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete teacher record' })
  remove(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.teachersService.remove(schoolId, id)
  }
}
