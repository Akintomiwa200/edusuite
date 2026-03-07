import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name)
}
