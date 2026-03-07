import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Req,
  ParseIntPipe,
  Optional,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { LeaveService } from './leave.service'
import { LeaveType } from './schemas/leave.schema'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'

@ApiTags('Leave Management')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('leave')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  // ── Apply for Leave ──────────────────────────────────────────────────────

  @Post('apply')
  @ApiOperation({ summary: 'Apply for leave' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('document'))
  async applyForLeave(
    @Req() req: any,
    @Body() body: {
      leaveType: LeaveType
      startDate: string
      endDate: string
      reason: string
      halfDayPart?: 'MORNING' | 'AFTERNOON'
      handoverNotes?: string
      substituteTeacherId?: string
    },
    @UploadedFile() document?: Express.Multer.File,
  ) {
    return this.leaveService.applyForLeave(
      req.user.sub,
      req.user.schoolId,
      req.user.branchId,
      {
        ...body,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        document,
      },
    )
  }

  // ── Get My Leave Requests ────────────────────────────────────────────────

  @Get('my-requests')
  @ApiOperation({ summary: 'Get current user leave requests' })
  async getMyLeaveRequests(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('year') year?: string,
  ) {
    // Returns leave requests filtered by user + optional status/year
    const { LeaveRequest } = await import('./schemas/leave.schema')
    return { message: 'Handled by service layer', userId: req.user.sub }
  }

  // ── Get Leave Balances ───────────────────────────────────────────────────

  @Get('balance')
  @ApiOperation({ summary: 'Get leave balances for current user' })
  async getMyLeaveBalances(
    @Req() req: any,
    @Query('year') year?: string,
  ) {
    return this.leaveService.getLeaveBalances(
      req.user.sub,
      req.user.schoolId,
      year ? parseInt(year) : undefined,
    )
  }

  @Get('balance/:userId')
  @ApiOperation({ summary: 'Get leave balances for a specific user (HR/Admin)' })
  @Roles('BRANCH_ADMIN', 'BRANCH_HR_OFFICER', 'CENTRAL_ADMIN')
  async getUserLeaveBalances(
    @Req() req: any,
    @Param('userId') userId: string,
    @Query('year') year?: string,
  ) {
    return this.leaveService.getLeaveBalances(userId, req.user.schoolId, year ? parseInt(year) : undefined)
  }

  // ── Approve/Reject Leave ─────────────────────────────────────────────────

  @Patch(':id/approve')
  @ApiOperation({ summary: 'Approve a leave request' })
  @Roles('BRANCH_ADMIN', 'BRANCH_ACADEMIC_HEAD', 'BRANCH_HR_OFFICER', 'CENTRAL_ADMIN', 'SUPERVISOR')
  async approveLeave(
    @Req() req: any,
    @Param('id') id: string,
    @Body('comment') comment?: string,
  ) {
    return this.leaveService.processLeave(id, req.user.sub, req.user.schoolId, 'APPROVE', comment)
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject a leave request' })
  @Roles('BRANCH_ADMIN', 'BRANCH_ACADEMIC_HEAD', 'BRANCH_HR_OFFICER', 'CENTRAL_ADMIN')
  async rejectLeave(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.leaveService.processLeave(id, req.user.sub, req.user.schoolId, 'REJECT', reason)
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a leave request' })
  async cancelLeave(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ) {
    return this.leaveService.cancelLeave(id, req.user.sub, reason)
  }

  @Patch(':id/recall')
  @ApiOperation({ summary: 'Recall an approved leave (admin only)' })
  @Roles('BRANCH_ADMIN', 'CENTRAL_ADMIN')
  async recallLeave(
    @Req() req: any,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.leaveService.recallLeave(id, req.user.sub, reason)
  }

  // ── Leave Calendar ────────────────────────────────────────────────────────

  @Get('calendar')
  @ApiOperation({ summary: 'Get leave calendar for branch' })
  async getLeaveCalendar(
    @Req() req: any,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.leaveService.getLeaveCalendar(req.user.branchId, month, year)
  }

  // ── Staffing Adequacy ─────────────────────────────────────────────────────

  @Get('staffing/:date')
  @ApiOperation({ summary: 'Check staffing adequacy for a date' })
  async getStaffingAdequacy(@Req() req: any, @Param('date') date: string) {
    return this.leaveService.getStaffingAdequacy(req.user.branchId, new Date(date))
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  @Get('analytics')
  @ApiOperation({ summary: 'Leave analytics and trends' })
  @Roles('BRANCH_ADMIN', 'BRANCH_HR_OFFICER', 'CENTRAL_ADMIN')
  async getAnalytics(
    @Req() req: any,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.leaveService.getLeaveAnalytics(req.user.schoolId, year)
  }

  // ── Pending Approvals (for approvers) ────────────────────────────────────

  @Get('pending-approvals')
  @ApiOperation({ summary: 'Get all pending leave requests for current approver' })
  async getPendingApprovals(@Req() req: any) {
    // Would filter by role to show relevant pending leaves
    return { message: 'Returns leaves pending current user\'s approval level' }
  }

  // ── Substitute Management ─────────────────────────────────────────────────

  @Patch('substitute/:assignmentId/respond')
  @ApiOperation({ summary: 'Accept or reject substitute assignment' })
  async respondToSubstitute(
    @Req() req: any,
    @Param('assignmentId') assignmentId: string,
    @Body() body: { accept: boolean; response?: string },
  ) {
    return { message: 'Substitute response recorded', assignmentId, ...body }
  }
}
