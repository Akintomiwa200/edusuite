import {
  Controller, Get, Post, Put, Patch, Body, Param, Query, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { FinancialService } from './financial.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { SubscriptionGuard } from '../../common/guards/subscription.guard'
import { Roles, CurrentUser, SchoolId } from '../../common/decorators/roles.decorator'
import { RequireFeature } from '../../common/decorators/subscription-feature.decorator'
import { UserRole } from '@edusuite/shared-types'
import { InvoiceStatus, PaymentMethod, AccountType } from './schemas/financial.schema'

@ApiTags('Financial')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, SubscriptionGuard)
@RequireFeature('fees')
@Controller('financial')
export class FinancialController {
  constructor(private readonly financialService: FinancialService) {}

  // ─── Fee Structures ───────────────────────────────────────────────────────

  @Post('fee-structures')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  createFeeStructure(@SchoolId() schoolId: string, @Body() dto: any) {
    return this.financialService.createFeeStructure(schoolId, dto)
  }

  @Get('fee-structures')
  getFeeStructures(@SchoolId() schoolId: string, @Query() query: any) {
    return this.financialService.getFeeStructures(schoolId, query)
  }

  @Put('fee-structures/:id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  updateFeeStructure(@Param('id') id: string, @SchoolId() schoolId: string, @Body() dto: any) {
    return this.financialService.updateFeeStructure(id, schoolId, dto)
  }

  // ─── Invoices ─────────────────────────────────────────────────────────────

  @Post('invoices')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  createInvoice(@SchoolId() schoolId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.financialService.createInvoice(schoolId, { ...dto, createdBy: user._id })
  }

  @Post('invoices/bulk')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  @ApiOperation({ summary: 'Generate invoices for multiple students at once' })
  generateBulkInvoices(@SchoolId() schoolId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.financialService.generateBulkInvoices(schoolId, { ...dto, createdBy: user._id })
  }

  @Get('invoices')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  getInvoices(@SchoolId() schoolId: string, @Query() query: any) {
    return this.financialService.getInvoices(schoolId, query)
  }

  @Get('invoices/student/:studentId')
  getStudentInvoices(@Param('studentId') studentId: string, @SchoolId() schoolId: string) {
    return this.financialService.getStudentInvoices(studentId, schoolId)
  }

  @Get('invoices/defaulters')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  getDefaulters(@SchoolId() schoolId: string, @Query('academicYearId') yearId: string) {
    return this.financialService.getDefaultersList(schoolId, yearId)
  }

  @Post('invoices/apply-penalties')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  applyPenalties(@SchoolId() schoolId: string) {
    return this.financialService.applyPenalties(schoolId)
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  @Post('payments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  @ApiOperation({ summary: 'Record a fee payment' })
  recordPayment(@SchoolId() schoolId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.financialService.recordPayment(schoolId, { ...dto, receivedBy: user._id })
  }

  @Get('payments')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  getPayments(@SchoolId() schoolId: string, @Query() query: any) {
    return this.financialService.getPayments(schoolId, query)
  }

  @Get('payments/daily-report')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  getDailyReport(@SchoolId() schoolId: string, @Query('date') date: string) {
    return this.financialService.getDailyCollectionReport(schoolId, date ? new Date(date) : new Date())
  }

  // ─── Accounting ───────────────────────────────────────────────────────────

  @Post('accounts')
  @RequireFeature('accounting')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  createAccount(@SchoolId() schoolId: string, @Body() dto: any) {
    return this.financialService.createAccount(schoolId, dto)
  }

  @Get('accounts')
  @RequireFeature('accounting')
  getAccounts(@SchoolId() schoolId: string, @Query('type') type: AccountType) {
    return this.financialService.getAccounts(schoolId, type)
  }

  @Post('journal')
  @RequireFeature('accounting')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  createJournalEntry(@SchoolId() schoolId: string, @Body() dto: any, @CurrentUser() user: any) {
    return this.financialService.createJournalEntry(schoolId, { ...dto, createdBy: user._id })
  }

  @Get('trial-balance')
  @RequireFeature('accounting')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  getTrialBalance(@SchoolId() schoolId: string) {
    return this.financialService.getTrialBalance(schoolId)
  }

  @Get('summary')
  @Roles(UserRole.SUPER_ADMIN, UserRole.SCHOOL_ADMIN, UserRole.ACCOUNTING_OFFICER)
  getSummary(@SchoolId() schoolId: string, @Query('academicYearId') yearId: string) {
    return this.financialService.getFinancialSummary(schoolId, yearId)
  }
}
