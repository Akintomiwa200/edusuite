import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { InventoryService } from './inventory.service'
import { InventoryController } from './inventory.controller'

@Module({
  imports: [MongooseModule.forFeature([])],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
