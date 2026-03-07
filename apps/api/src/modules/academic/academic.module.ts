import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { AcademicService } from './academic.service'
import { AcademicController } from './academic.controller'
import { AcademicYear, AcademicYearSchema } from './schemas/academic.schema'
import { Subject, SubjectSchema } from './schemas/academic.schema'
import { ClassRoom, ClassRoomSchema } from './schemas/academic.schema'
import { Timetable, TimetableSchema } from './schemas/academic.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AcademicYear.name, schema: AcademicYearSchema },
      { name: Subject.name, schema: SubjectSchema },
      { name: ClassRoom.name, schema: ClassRoomSchema },
      { name: Timetable.name, schema: TimetableSchema },
    ]),
  ],
  controllers: [AcademicController],
  providers: [AcademicService],
  exports: [AcademicService, MongooseModule],
})
export class AcademicModule {}
