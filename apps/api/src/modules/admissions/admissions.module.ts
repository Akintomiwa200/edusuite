import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AdmissionsService } from './admissions.service'
import { AdmissionsController } from './admissions.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [AdmissionsService],
  controllers: [AdmissionsController],
  exports: [AdmissionsService],
})
export class AdmissionsModule {}
