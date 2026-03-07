import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { CafeteriaService } from './cafeteria.service'
import { CafeteriaController } from './cafeteria.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [CafeteriaService],
  controllers: [CafeteriaController],
  exports: [CafeteriaService],
})
export class CafeteriaModule {}
