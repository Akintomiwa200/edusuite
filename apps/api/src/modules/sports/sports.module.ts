import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SportsService } from './sports.service'
import { SportsController } from './sports.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [SportsService],
  controllers: [SportsController],
  exports: [SportsService],
})
export class SportsModule {}
