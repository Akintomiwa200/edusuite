import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class AlumniService {
  private readonly logger = new Logger(AlumniService.name)
}
