import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { HealthMedicalService } from './healthmedical.service'
import { HealthMedicalController } from './healthmedical.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [HealthMedicalService],
  controllers: [HealthMedicalController],
  exports: [HealthMedicalService],
})
export class HealthMedicalModule {}
