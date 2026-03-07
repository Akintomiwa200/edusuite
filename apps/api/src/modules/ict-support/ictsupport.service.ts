import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class IctSupportService {
  private readonly logger = new Logger(IctSupportService.name)
}
