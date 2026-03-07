import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { FinancialService } from './financial.service'
import { FinancialController } from './financial.controller'
import {
  FeeStructure, FeeStructureSchema,
  Invoice, InvoiceSchema,
  Payment, PaymentSchema,
  Account, AccountSchema,
  JournalEntry, JournalEntrySchema,
} from './schemas/financial.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: FeeStructure.name, schema: FeeStructureSchema },
      { name: Invoice.name, schema: InvoiceSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: Account.name, schema: AccountSchema },
      { name: JournalEntry.name, schema: JournalEntrySchema },
    ]),
  ],
  controllers: [FinancialController],
  providers: [FinancialService],
  exports: [FinancialService, MongooseModule],
})
export class FinancialModule {}
