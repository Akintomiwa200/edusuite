import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class CommunicationService {
  private readonly logger = new Logger(CommunicationService.name)
}
