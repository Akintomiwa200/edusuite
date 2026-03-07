import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class SportsService {
  private readonly logger = new Logger(SportsService.name)
}
