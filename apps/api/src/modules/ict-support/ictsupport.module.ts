import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { IctSupportService } from './ictsupport.service'
import { IctSupportController } from './ictsupport.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [IctSupportService],
  controllers: [IctSupportController],
  exports: [IctSupportService],
})
export class IctSupportModule {}
