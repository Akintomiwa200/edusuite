import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { HostelService } from './hostel.service'
import { HostelController } from './hostel.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [HostelService],
  controllers: [HostelController],
  exports: [HostelService],
})
export class HostelModule {}
