import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AuditLogService } from './auditlogs.service'
import { AuditLogController } from './auditlogs.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [AuditLogService],
  controllers: [AuditLogController],
  exports: [AuditLogService],
})
export class AuditLogModule {}
