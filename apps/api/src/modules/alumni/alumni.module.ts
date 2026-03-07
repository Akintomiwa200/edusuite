import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AlumniService } from './alumni.service'
import { AlumniController } from './alumni.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [AlumniService],
  controllers: [AlumniController],
  exports: [AlumniService],
})
export class AlumniModule {}
