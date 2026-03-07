import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { TransportService } from './transport.service'
import { TransportController } from './transport.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [TransportService],
  controllers: [TransportController],
  exports: [TransportService],
})
export class TransportModule {}
