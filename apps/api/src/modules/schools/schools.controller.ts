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
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { SchoolsService } from './schools.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles, CurrentUser, SchoolId } from '../../common/decorators/roles.decorator'
import { UserRole } from '@edusuite/shared-types'
import { SubscriptionTier } from './schemas/school.schema'

@ApiTags('Schools')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create a new school (Super Admin only)' })
  create(@Body() dto: any) {
    return this.schoolsService.createSchool(dto)
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.REGIONAL_MANAGER)
  @ApiOperation({ summary: 'List all schools' })
  findAll(@Query() query: any) {
    return this.schoolsService.findAllSchools(query)
  }

  @Get('my-school')
  @ApiOperation({ summary: 'Get current user\'s school details' })
  getMySchool(@SchoolId() schoolId: string) {
    return this.schoolsService.getSchoolStats(schoolId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get school by ID' })
  findOne(@Param('id') id: string) {
    return this.schoolsService.findById(id)
  }

  @Put(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update school details' })
  update(@Param('id') id: string, @Body() dto: any) {
    return this.schoolsService.updateSchool(id, dto)
  }

  @Patch(':id/settings')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update school settings' })
  updateSettings(@Param('id') id: string, @Body() settings: any) {
    return this.schoolsService.updateSettings(id, settings)
  }

  @Patch(':id/subscription')
  @Roles(UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update subscription tier (Super Admin only)' })
  updateSubscription(@Param('id') id: string, @Body() dto: {
    tier: SubscriptionTier
    endDate: Date
    maxStudents?: number
    maxStaff?: number
    maxBranches?: number
  }) {
    return this.schoolsService.updateSubscription(id, dto)
  }

  @Patch(':id/current-term')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACADEMIC_HEAD)
  @ApiOperation({ summary: 'Set current academic term' })
  setCurrentTerm(@Param('id') id: string, @Body() termData: any) {
    return this.schoolsService.setCurrentTerm(id, termData)
  }

  // ─── Branches ────────────────────────────────────────────────────────────────

  @Post(':id/branches')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Create a branch' })
  createBranch(@Param('id') schoolId: string, @Body() dto: any) {
    return this.schoolsService.createBranch(schoolId, dto)
  }

  @Get(':id/branches')
  @ApiOperation({ summary: 'Get all branches of a school' })
  getBranches(@Param('id') schoolId: string) {
    return this.schoolsService.getBranches(schoolId)
  }

  @Put('branches/:branchId')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN)
  @ApiOperation({ summary: 'Update branch' })
  updateBranch(@Param('branchId') branchId: string, @Body() dto: any) {
    return this.schoolsService.updateBranch(branchId, dto)
  }
}
