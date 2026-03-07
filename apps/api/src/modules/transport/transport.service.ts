import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class TransportService {
  private readonly logger = new Logger(TransportService.name)
}
