import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Fee Structure ─────────────────────────────────────────────────────────────

export type FeeStructureDocument = FeeStructure & Document

export enum BillingCycle { TERMLY = 'termly', MONTHLY = 'monthly', ANNUALLY = 'annually', ONCE = 'once' }
export enum FeeType {
  TUITION = 'tuition', PTA = 'pta', DEVELOPMENT = 'development_levy',
  SPORTS = 'sports', LAB = 'laboratory', ICT = 'ict', LIBRARY = 'library',
  UNIFORM = 'uniform', TEXTBOOK = 'textbook', EXAM = 'exam', ADMISSION = 'admission',
  BOARDING = 'boarding', TRANSPORT = 'transport', FEEDING = 'feeding', MISCELLANEOUS = 'miscellaneous',
}

@Schema({ timestamps: true, collection: 'fee_structures' })
export class FeeStructure {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ required: true, trim: true })
  name: string // e.g. "JSS 1 Fees - 2024/2025 Term 1"

  @Prop({ enum: Object.values(FeeType), required: true })
  type: FeeType

  @Prop({ required: true, min: 0 })
  amount: number

  @Prop({ enum: Object.values(BillingCycle), default: BillingCycle.TERMLY })
  billingCycle: BillingCycle

  @Prop({ type: [String] }) // Applicable class levels e.g. ["JSS 1", "JSS 2"]
  applicableLevels: string[]

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear' })
  academicYearId?: Types.ObjectId

  @Prop({ type: Number, enum: [1, 2, 3] })
  termNumber?: 1 | 2 | 3

  @Prop({
    type: [{
      type: { type: String, enum: ['percentage', 'fixed'] },
      value: Number,
      label: String, // e.g. "Sibling discount", "Scholarship"
    }],
  })
  discounts: Array<{ type: 'percentage' | 'fixed'; value: number; label: string }>

  @Prop({ default: 0, min: 0 })
  penaltyPercentage: number // Late payment penalty %

  @Prop({ default: 0 }) // Days after due date penalty kicks in
  penaltyGraceDays: number

  @Prop({ default: true })
  isActive: boolean

  @Prop({ trim: true })
  description?: string
}

export const FeeStructureSchema = SchemaFactory.createForClass(FeeStructure)
FeeStructureSchema.index({ schoolId: 1, type: 1, academicYearId: 1 })

// ─── Invoice ───────────────────────────────────────────────────────────────────

export type InvoiceDocument = Invoice & Document

export enum InvoiceStatus {
  DRAFT = 'draft', PENDING = 'pending', PARTIAL = 'partial',
  PAID = 'paid', OVERDUE = 'overdue', CANCELLED = 'cancelled', WAIVED = 'waived',
}

@Schema({ timestamps: true, collection: 'invoices' })
export class Invoice {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ required: true, unique: true, trim: true, index: true })
  invoiceNumber: string // e.g. INV/2024/00001

  @Prop({ type: Types.ObjectId, ref: 'AcademicYear' })
  academicYearId?: Types.ObjectId

  @Prop({ type: Number, enum: [1, 2, 3] })
  termNumber?: 1 | 2 | 3

  @Prop({
    type: [{
      description: String,
      feeStructureId: { type: Types.ObjectId, ref: 'FeeStructure' },
      feeType: String,
      amount: Number,
      discount: { type: Number, default: 0 },
      netAmount: Number,
    }],
  })
  lineItems: Array<{
    description: string
    feeStructureId?: Types.ObjectId
    feeType?: string
    amount: number
    discount: number
    netAmount: number
  }>

  @Prop({ required: true, min: 0 })
  subtotal: number

  @Prop({ default: 0, min: 0 })
  totalDiscount: number

  @Prop({ default: 0, min: 0 })
  penalty: number

  @Prop({ required: true, min: 0 })
  totalAmount: number

  @Prop({ default: 0, min: 0 })
  amountPaid: number

  @Prop({ min: 0 })
  balance: number // totalAmount - amountPaid

  @Prop({ enum: Object.values(InvoiceStatus), default: InvoiceStatus.PENDING, index: true })
  status: InvoiceStatus

  @Prop({ required: true })
  dueDate: Date

  @Prop()
  paidDate?: Date

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId

  @Prop({ trim: true })
  notes?: string

  @Prop({ default: false })
  isLOC: boolean // Line of credit invoice
}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice)
InvoiceSchema.index({ schoolId: 1, studentId: 1, status: 1 })
InvoiceSchema.index({ schoolId: 1, dueDate: 1, status: 1 })

// ─── Payment ───────────────────────────────────────────────────────────────────

export type PaymentDocument = Payment & Document

export enum PaymentMethod {
  CASH = 'cash', TRANSFER = 'bank_transfer', CARD = 'card',
  PAYSTACK = 'paystack', FLUTTERWAVE = 'flutterwave', REMITA = 'remita',
  POS = 'pos', CHEQUE = 'cheque', ONLINE = 'online',
}

export enum PaymentStatus {
  PENDING = 'pending', SUCCESS = 'success', FAILED = 'failed',
  REVERSED = 'reversed', REFUNDED = 'refunded',
}

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Invoice', required: true, index: true })
  invoiceId: Types.ObjectId

  @Prop({ required: true, unique: true, trim: true })
  receiptNumber: string // e.g. RCP/2024/00001

  @Prop({ required: true, min: 0.01 })
  amount: number

  @Prop({ enum: Object.values(PaymentMethod), required: true })
  method: PaymentMethod

  @Prop({ enum: Object.values(PaymentStatus), default: PaymentStatus.PENDING, index: true })
  status: PaymentStatus

  @Prop({ trim: true })
  reference?: string // Bank/gateway reference

  @Prop({ trim: true })
  transactionId?: string // Gateway transaction ID

  @Prop({
    type: {
      gateway: String,
      reference: String,
      channel: String,
      paidAt: Date,
      rawResponse: Object,
    },
    _id: false,
  })
  gatewayData?: {
    gateway: string
    reference: string
    channel?: string
    paidAt?: Date
    rawResponse?: any
  }

  @Prop({ type: Types.ObjectId, ref: 'User' })
  receivedBy: Types.ObjectId // Cashier who received

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId

  @Prop()
  paymentDate: Date

  @Prop({ trim: true })
  notes?: string

  @Prop({ default: false })
  isReversed: boolean

  @Prop()
  reversedAt?: Date

  @Prop({ trim: true })
  reversalReason?: string
}

export const PaymentSchema = SchemaFactory.createForClass(Payment)
PaymentSchema.index({ schoolId: 1, paymentDate: 1 })
PaymentSchema.index({ schoolId: 1, status: 1 })

// ─── Chart of Accounts ────────────────────────────────────────────────────────

export type AccountDocument = Account & Document

export enum AccountType {
  ASSET = 'asset', LIABILITY = 'liability',
  INCOME = 'income', EXPENSE = 'expense', EQUITY = 'equity',
}

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ required: true, trim: true, unique: true })
  code: string // e.g. 1001

  @Prop({ required: true, trim: true })
  name: string

  @Prop({ enum: Object.values(AccountType), required: true })
  type: AccountType

  @Prop({ trim: true })
  description?: string

  @Prop({ type: Types.ObjectId, ref: 'Account' })
  parentAccountId?: Types.ObjectId

  @Prop({ default: 0 })
  balance: number

  @Prop({ default: true })
  isActive: boolean

  @Prop({ default: false })
  isSystemAccount: boolean // Cannot be deleted
}

export const AccountSchema = SchemaFactory.createForClass(Account)
AccountSchema.index({ schoolId: 1, code: 1 }, { unique: true })
AccountSchema.index({ schoolId: 1, type: 1 })

// ─── Journal Entry ────────────────────────────────────────────────────────────

export type JournalEntryDocument = JournalEntry & Document

@Schema({ timestamps: true, collection: 'journal_entries' })
export class JournalEntry {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ required: true, unique: true, trim: true })
  referenceNumber: string

  @Prop({ required: true, trim: true })
  description: string

  @Prop({ required: true })
  entryDate: Date

  @Prop({
    type: [{
      accountId: { type: Types.ObjectId, ref: 'Account' },
      debit: { type: Number, default: 0 },
      credit: { type: Number, default: 0 },
      narration: String,
    }],
    required: true,
  })
  lines: Array<{
    accountId: Types.ObjectId
    debit: number
    credit: number
    narration?: string
  }>

  @Prop({ required: true, min: 0 })
  totalAmount: number

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId

  @Prop({ default: false })
  isApproved: boolean

  @Prop({ default: false })
  isReversed: boolean

  @Prop({ trim: true })
  relatedTo?: string // e.g. Payment ID, Payroll ID

  @Prop({ trim: true })
  relatedModel?: string
}

export const JournalEntrySchema = SchemaFactory.createForClass(JournalEntry)
JournalEntrySchema.index({ schoolId: 1, entryDate: 1 })
