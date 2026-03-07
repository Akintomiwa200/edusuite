import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SchoolsService } from './schools.service'
import { SchoolsController } from './schools.controller'
import { School, SchoolSchema, Branch, BranchSchema } from './schemas/school.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: School.name, schema: SchoolSchema },
      { name: Branch.name, schema: BranchSchema },
    ]),
  ],
  controllers: [SchoolsController],
  providers: [SchoolsService],
  exports: [SchoolsService, MongooseModule],
})
export class SchoolsModule {}
