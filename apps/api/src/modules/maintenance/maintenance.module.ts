import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { MaintenanceService } from './maintenance.service'
import { MaintenanceController } from './maintenance.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [MaintenanceService],
  controllers: [MaintenanceController],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
