import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SecurityService } from './security.service'
import { SecurityController } from './security.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [SecurityService],
  controllers: [SecurityController],
  exports: [SecurityService],
})
export class SecurityModule {}
