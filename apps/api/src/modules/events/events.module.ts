import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { EventsService } from './events.service'
import { EventsController } from './events.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
