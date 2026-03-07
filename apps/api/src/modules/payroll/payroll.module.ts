import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { PayrollService } from './payroll.service'
import { PayrollController } from './payroll.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [PayrollService],
  controllers: [PayrollController],
  exports: [PayrollService],
})
export class PayrollModule {}
