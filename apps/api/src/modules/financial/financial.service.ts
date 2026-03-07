import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ConflictException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types, ClientSession } from 'mongoose'
import { InjectConnection } from '@nestjs/mongoose'
import { Connection } from 'mongoose'
import {
  FeeStructure, FeeStructureDocument,
  Invoice, InvoiceDocument, InvoiceStatus,
  Payment, PaymentDocument, PaymentMethod, PaymentStatus,
  Account, AccountDocument, AccountType,
  JournalEntry, JournalEntryDocument,
} from './schemas/financial.schema'

@Injectable()
export class FinancialService {
  private readonly logger = new Logger(FinancialService.name)

  constructor(
    @InjectModel(FeeStructure.name) private feeStructureModel: Model<FeeStructureDocument>,
    @InjectModel(Invoice.name) private invoiceModel: Model<InvoiceDocument>,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(JournalEntry.name) private journalModel: Model<JournalEntryDocument>,
    @InjectConnection() private connection: Connection,
  ) {}

  // ─── Counters ─────────────────────────────────────────────────────────────

  private async generateInvoiceNumber(schoolId: string): Promise<string> {
    const year = new Date().getFullYear()
    const count = await this.invoiceModel.countDocuments({ schoolId })
    return `INV/${year}/${String(count + 1).padStart(5, '0')}`
  }

  private async generateReceiptNumber(schoolId: string): Promise<string> {
    const year = new Date().getFullYear()
    const count = await this.paymentModel.countDocuments({ schoolId })
    return `RCP/${year}/${String(count + 1).padStart(5, '0')}`
  }

  private async generateJournalRef(schoolId: string): Promise<string> {
    const year = new Date().getFullYear()
    const count = await this.journalModel.countDocuments({ schoolId })
    return `JNL/${year}/${String(count + 1).padStart(5, '0')}`
  }

  // ─── Fee Structures ───────────────────────────────────────────────────────

  async createFeeStructure(schoolId: string, dto: any) {
    return this.feeStructureModel.create({ ...dto, schoolId })
  }

  async getFeeStructures(schoolId: string, query: { academicYearId?: string; termNumber?: number; type?: string }) {
    const filter: any = { schoolId, isActive: true }
    if (query.academicYearId) filter.academicYearId = new Types.ObjectId(query.academicYearId)
    if (query.termNumber) filter.termNumber = query.termNumber
    if (query.type) filter.type = query.type

    return this.feeStructureModel.find(filter).sort({ type: 1, amount: 1 })
  }

  async updateFeeStructure(id: string, schoolId: string, dto: any) {
    const fee = await this.feeStructureModel.findOneAndUpdate(
      { _id: id, schoolId },
      { $set: dto },
      { new: true },
    )
    if (!fee) throw new NotFoundException('Fee structure not found')
    return fee
  }

  // ─── Invoices ─────────────────────────────────────────────────────────────

  async createInvoice(schoolId: string, dto: {
    studentId: string
    lineItems: Array<{ description: string; feeStructureId?: string; feeType?: string; amount: number; discount?: number }>
    dueDate: Date
    academicYearId?: string
    termNumber?: 1 | 2 | 3
    notes?: string
    createdBy: string
  }) {
    const lineItems = dto.lineItems.map((item) => ({
      ...item,
      discount: item.discount || 0,
      netAmount: item.amount - (item.discount || 0),
      feeStructureId: item.feeStructureId ? new Types.ObjectId(item.feeStructureId) : undefined,
    }))

    const subtotal = lineItems.reduce((sum, i) => sum + i.amount, 0)
    const totalDiscount = lineItems.reduce((sum, i) => sum + i.discount, 0)
    const totalAmount = lineItems.reduce((sum, i) => sum + i.netAmount, 0)

    const invoiceNumber = await this.generateInvoiceNumber(schoolId)

    const invoice = await this.invoiceModel.create({
      schoolId,
      studentId: new Types.ObjectId(dto.studentId),
      invoiceNumber,
      lineItems,
      subtotal,
      totalDiscount,
      totalAmount,
      balance: totalAmount,
      amountPaid: 0,
      status: InvoiceStatus.PENDING,
      dueDate: dto.dueDate,
      academicYearId: dto.academicYearId ? new Types.ObjectId(dto.academicYearId) : undefined,
      termNumber: dto.termNumber,
      notes: dto.notes,
      createdBy: new Types.ObjectId(dto.createdBy),
    })

    this.logger.log(`Invoice ${invoiceNumber} created for student ${dto.studentId}`)
    return invoice
  }

  async generateBulkInvoices(schoolId: string, dto: {
    studentIds: string[]
    feeStructureIds: string[]
    dueDate: Date
    academicYearId?: string
    termNumber?: 1 | 2 | 3
    createdBy: string
  }) {
    const feeStructures = await this.feeStructureModel.find({
      _id: { $in: dto.feeStructureIds.map((id) => new Types.ObjectId(id)) },
      schoolId,
    })

    const results = await Promise.allSettled(
      dto.studentIds.map((studentId) =>
        this.createInvoice(schoolId, {
          studentId,
          lineItems: feeStructures.map((f) => ({
            description: f.name,
            feeStructureId: f._id.toString(),
            feeType: f.type,
            amount: f.amount,
            discount: 0,
          })),
          dueDate: dto.dueDate,
          academicYearId: dto.academicYearId,
          termNumber: dto.termNumber,
          createdBy: dto.createdBy,
        }),
      ),
    )

    return {
      created: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    }
  }

  async getInvoices(schoolId: string, query: {
    page?: number
    limit?: number
    studentId?: string
    status?: InvoiceStatus
    academicYearId?: string
    termNumber?: number
    overdue?: boolean
  }) {
    const { page = 1, limit = 20, studentId, status, academicYearId, termNumber, overdue } = query
    const filter: any = { schoolId }

    if (studentId) filter.studentId = new Types.ObjectId(studentId)
    if (status) filter.status = status
    if (academicYearId) filter.academicYearId = new Types.ObjectId(academicYearId)
    if (termNumber) filter.termNumber = termNumber
    if (overdue) {
      filter.dueDate = { $lt: new Date() }
      filter.status = { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] }
    }

    const [data, total] = await Promise.all([
      this.invoiceModel
        .find(filter)
        .populate('studentId', 'firstName lastName admissionNumber currentClass')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 }),
      this.invoiceModel.countDocuments(filter),
    ])

    return { data, pagination: { total, page, limit, pages: Math.ceil(total / limit) } }
  }

  async getStudentInvoices(studentId: string, schoolId: string) {
    return this.invoiceModel
      .find({ studentId: new Types.ObjectId(studentId), schoolId })
      .sort({ createdAt: -1 })
  }

  async applyPenalties(schoolId: string) {
    const overdueInvoices = await this.invoiceModel.find({
      schoolId,
      status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL] },
      dueDate: { $lt: new Date() },
    })

    let penalized = 0
    for (const invoice of overdueInvoices) {
      const feeStructureId = invoice.lineItems[0]?.feeStructureId
      if (!feeStructureId) continue

      const feeStructure = await this.feeStructureModel.findById(feeStructureId)
      if (!feeStructure?.penaltyPercentage) continue

      const penalty = (invoice.balance * feeStructure.penaltyPercentage) / 100
      await this.invoiceModel.findByIdAndUpdate(invoice._id, {
        $inc: { penalty: penalty, totalAmount: penalty, balance: penalty },
        $set: { status: InvoiceStatus.OVERDUE },
      })
      penalized++
    }

    return { processed: overdueInvoices.length, penalized }
  }

  // ─── Payments ─────────────────────────────────────────────────────────────

  async recordPayment(schoolId: string, dto: {
    studentId: string
    invoiceId: string
    amount: number
    method: PaymentMethod
    receivedBy: string
    reference?: string
    notes?: string
    paymentDate?: Date
  }) {
    const invoice = await this.invoiceModel.findOne({ _id: dto.invoiceId, schoolId })
    if (!invoice) throw new NotFoundException('Invoice not found')
    if (invoice.status === InvoiceStatus.PAID) throw new BadRequestException('Invoice is already fully paid')
    if (invoice.status === InvoiceStatus.CANCELLED) throw new BadRequestException('Invoice is cancelled')

    if (dto.amount > invoice.balance) {
      throw new BadRequestException(`Payment amount exceeds balance. Balance: ₦${invoice.balance}`)
    }

    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const receiptNumber = await this.generateReceiptNumber(schoolId)
      const payment = await this.paymentModel.create([{
        schoolId,
        studentId: new Types.ObjectId(dto.studentId),
        invoiceId: new Types.ObjectId(dto.invoiceId),
        receiptNumber,
        amount: dto.amount,
        method: dto.method,
        status: PaymentStatus.SUCCESS,
        reference: dto.reference,
        receivedBy: new Types.ObjectId(dto.receivedBy),
        paymentDate: dto.paymentDate || new Date(),
        notes: dto.notes,
      }], { session })

      const newAmountPaid = invoice.amountPaid + dto.amount
      const newBalance = invoice.totalAmount - newAmountPaid
      const newStatus = newBalance <= 0 ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL

      await this.invoiceModel.findByIdAndUpdate(
        invoice._id,
        {
          $set: {
            amountPaid: newAmountPaid,
            balance: Math.max(0, newBalance),
            status: newStatus,
            ...(newStatus === InvoiceStatus.PAID && { paidDate: new Date() }),
          },
        },
        { session },
      )

      await session.commitTransaction()
      this.logger.log(`Payment ${receiptNumber} of ₦${dto.amount} recorded for invoice ${invoice.invoiceNumber}`)
      return payment[0]
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      session.endSession()
    }
  }

  async getPayments(schoolId: string, query: {
    page?: number
    limit?: number
    studentId?: string
    method?: PaymentMethod
    startDate?: Date
    endDate?: Date
  }) {
    const { page = 1, limit = 20, studentId, method, startDate, endDate } = query
    const filter: any = { schoolId, status: PaymentStatus.SUCCESS }

    if (studentId) filter.studentId = new Types.ObjectId(studentId)
    if (method) filter.method = method
    if (startDate || endDate) {
      filter.paymentDate = {}
      if (startDate) filter.paymentDate.$gte = startDate
      if (endDate) filter.paymentDate.$lte = endDate
    }

    const [data, total, totalAmount] = await Promise.all([
      this.paymentModel
        .find(filter)
        .populate('studentId', 'firstName lastName admissionNumber')
        .populate('invoiceId', 'invoiceNumber')
        .populate('receivedBy', 'firstName lastName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ paymentDate: -1 }),
      this.paymentModel.countDocuments(filter),
      this.paymentModel.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ])

    return {
      data,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      summary: { totalAmount: totalAmount[0]?.total || 0 },
    }
  }

  async getDailyCollectionReport(schoolId: string, date: Date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const payments = await this.paymentModel.aggregate([
      {
        $match: {
          schoolId: new Types.ObjectId(schoolId),
          paymentDate: { $gte: startOfDay, $lte: endOfDay },
          status: PaymentStatus.SUCCESS,
        },
      },
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          total: { $sum: '$amount' },
        },
      },
    ])

    const grandTotal = payments.reduce((sum, p) => sum + p.total, 0)
    return { date, byMethod: payments, grandTotal }
  }

  // ─── Accounting ───────────────────────────────────────────────────────────

  async createAccount(schoolId: string, dto: any) {
    const existing = await this.accountModel.findOne({ schoolId, code: dto.code })
    if (existing) throw new ConflictException(`Account code '${dto.code}' already exists`)
    return this.accountModel.create({ ...dto, schoolId })
  }

  async getAccounts(schoolId: string, type?: AccountType) {
    const filter: any = { schoolId, isActive: true }
    if (type) filter.type = type
    return this.accountModel.find(filter).sort({ code: 1 })
  }

  async createJournalEntry(schoolId: string, dto: {
    description: string
    entryDate: Date
    lines: Array<{ accountId: string; debit: number; credit: number; narration?: string }>
    createdBy: string
    relatedTo?: string
    relatedModel?: string
  }) {
    // Validate double-entry: total debits must equal total credits
    const totalDebit = dto.lines.reduce((s, l) => s + (l.debit || 0), 0)
    const totalCredit = dto.lines.reduce((s, l) => s + (l.credit || 0), 0)

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      throw new BadRequestException(`Journal entry is unbalanced. Debits: ${totalDebit}, Credits: ${totalCredit}`)
    }

    const referenceNumber = await this.generateJournalRef(schoolId)

    const entry = await this.journalModel.create({
      schoolId,
      referenceNumber,
      description: dto.description,
      entryDate: dto.entryDate,
      lines: dto.lines.map((l) => ({
        ...l,
        accountId: new Types.ObjectId(l.accountId),
      })),
      totalAmount: totalDebit,
      createdBy: new Types.ObjectId(dto.createdBy),
      relatedTo: dto.relatedTo,
      relatedModel: dto.relatedModel,
    })

    // Update account balances
    for (const line of dto.lines) {
      const account = await this.accountModel.findById(line.accountId)
      if (!account) continue

      let balanceChange = 0
      // Debit increases assets/expenses, decreases liabilities/income/equity
      if (account.type === AccountType.ASSET || account.type === AccountType.EXPENSE) {
        balanceChange = (line.debit || 0) - (line.credit || 0)
      } else {
        balanceChange = (line.credit || 0) - (line.debit || 0)
      }

      await this.accountModel.findByIdAndUpdate(account._id, { $inc: { balance: balanceChange } })
    }

    return entry
  }

  async getTrialBalance(schoolId: string) {
    return this.accountModel.find({ schoolId, isActive: true }).sort({ code: 1 })
  }

  async getFinancialSummary(schoolId: string, academicYearId?: string) {
    const matchFilter: any = { schoolId: new Types.ObjectId(schoolId) }
    if (academicYearId) matchFilter.academicYearId = new Types.ObjectId(academicYearId)

    const [invoiceSummary, paymentSummary, overdueCount] = await Promise.all([
      this.invoiceModel.aggregate([
        { $match: matchFilter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
            totalBalance: { $sum: '$balance' },
          },
        },
      ]),
      this.paymentModel.aggregate([
        { $match: { ...matchFilter, status: PaymentStatus.SUCCESS } },
        { $group: { _id: null, totalCollected: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      this.invoiceModel.countDocuments({
        ...matchFilter,
        status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
        dueDate: { $lt: new Date() },
      }),
    ])

    return { invoiceSummary, paymentSummary: paymentSummary[0], overdueCount }
  }

  async getDefaultersList(schoolId: string, academicYearId?: string) {
    const filter: any = {
      schoolId: new Types.ObjectId(schoolId),
      status: { $in: [InvoiceStatus.PENDING, InvoiceStatus.PARTIAL, InvoiceStatus.OVERDUE] },
      balance: { $gt: 0 },
    }
    if (academicYearId) filter.academicYearId = new Types.ObjectId(academicYearId)

    return this.invoiceModel
      .find(filter)
      .populate('studentId', 'firstName lastName admissionNumber currentClass')
      .sort({ balance: -1 })
      .limit(100)
  }
}
