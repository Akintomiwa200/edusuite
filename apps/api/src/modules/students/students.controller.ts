import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { StudentsService } from './students.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles, CurrentUser, SchoolId } from '../../common/decorators/roles.decorator'
import { UserRole } from '@edusuite/shared-types'
import { StudentStatus } from './schemas/student.schema'

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Enroll a new student' })
  create(@SchoolId() schoolId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.studentsService.createStudent(schoolId, user.branchId, dto, dto.userId)
  }

  @Get()
  @ApiOperation({ summary: 'List students with filters' })
  findAll(@SchoolId() schoolId: string, @Query() query: any) {
    return this.studentsService.findAll(schoolId, query)
  }

  @Get('stats')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  @ApiOperation({ summary: 'Get student statistics' })
  getStats(@SchoolId() schoolId: string) {
    return this.studentsService.getStudentStats(schoolId)
  }

  @Get('search')
  @ApiOperation({ summary: 'Search students by name or admission number' })
  search(@SchoolId() schoolId: string, @Query('q') query: string, @Query('limit') limit: number) {
    return this.studentsService.searchStudents(schoolId, query, limit)
  }

  @Get('me')
  @Roles(UserRole.STUDENT)
  @ApiOperation({ summary: 'Get own student profile' })
  getMyProfile(@CurrentUser() user: any) {
    return this.studentsService.findByUserId(user._id)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  findOne(@Param('id') id: string, @SchoolId() schoolId: string) {
    return this.studentsService.findById(id, schoolId)
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Update student details' })
  update(@Param('id') id: string, @SchoolId() schoolId: string, @Body() dto: any) {
    return this.studentsService.updateStudent(id, schoolId, dto)
  }

  @Patch(':id/status')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update student status (graduate, suspend, etc.)' })
  updateStatus(
    @Param('id') id: string,
    @SchoolId() schoolId: string,
    @Body() body: { status: StudentStatus; notes?: string },
  ) {
    return this.studentsService.updateStatus(id, schoolId, body.status, body.notes)
  }

  @Patch(':id/class')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  @ApiOperation({ summary: 'Assign student to a class' })
  assignToClass(
    @Param('id') id: string,
    @SchoolId() schoolId: string,
    @Body('classId') classId: string,
  ) {
    return this.studentsService.assignToClass(id, classId, schoolId)
  }

  @Post('promote')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  @ApiOperation({ summary: 'Bulk promote students to new classes' })
  promote(
    @SchoolId() schoolId: string,
    @Body() body: { promotions: Array<{ studentId: string; newClassId: string }> },
  ) {
    return this.studentsService.promoteStudents(schoolId, body.promotions)
  }

  @Post(':id/parents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Add parent/guardian to student' })
  addParent(@Param('id') id: string, @SchoolId() schoolId: string, @Body() parentData: any) {
    return this.studentsService.addParent(id, schoolId, parentData)
  }

  @Put(':id/parents/:index')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Update parent/guardian info' })
  updateParent(
    @Param('id') id: string,
    @Param('index') index: number,
    @SchoolId() schoolId: string,
    @Body() parentData: any,
  ) {
    return this.studentsService.updateParent(id, schoolId, index, parentData)
  }

  @Post(':id/documents')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.HR_ADMIN)
  @ApiOperation({ summary: 'Add document to student record' })
  addDocument(
    @Param('id') id: string,
    @SchoolId() schoolId: string,
    @Body() doc: { name: string; url: string; cloudinaryId?: string },
  ) {
    return this.studentsService.addDocument(id, schoolId, doc)
  }
}
