import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class HostelService {
  private readonly logger = new Logger(HostelService.name)
}
