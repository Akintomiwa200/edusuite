import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { GamificationService } from './gamification.service'
import { GamificationController } from './gamification.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [GamificationService],
  controllers: [GamificationController],
  exports: [GamificationService],
})
export class GamificationModule {}
