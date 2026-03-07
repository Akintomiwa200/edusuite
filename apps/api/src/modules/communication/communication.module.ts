import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CommunicationService } from './communication.service'
import { CommunicationController } from './communication.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [CommunicationService],
  controllers: [CommunicationController],
  exports: [CommunicationService],
})
export class CommunicationModule {}
