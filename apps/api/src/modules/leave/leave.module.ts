import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { LeaveService } from './leave.service'
import { LeaveController } from './leave.controller'
import {
  LeaveRequest,
  LeaveRequestSchema,
  LeaveBalance,
  LeaveBalanceSchema,
  LeavePolicy,
  LeavePolicySchema,
  SubstituteAssignment,
  SubstituteAssignmentSchema,
} from './schemas/leave.schema'
import { NotificationsModule } from '../notifications/notifications.module'
import { CloudinaryModule } from '../../common/cloudinary.module'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LeaveRequest.name, schema: LeaveRequestSchema },
      { name: LeaveBalance.name, schema: LeaveBalanceSchema },
      { name: LeavePolicy.name, schema: LeavePolicySchema },
      { name: SubstituteAssignment.name, schema: SubstituteAssignmentSchema },
    ]),
    NotificationsModule,
    CloudinaryModule,
  ],
  providers: [LeaveService],
  controllers: [LeaveController],
  exports: [LeaveService],
})
export class LeaveModule {}
