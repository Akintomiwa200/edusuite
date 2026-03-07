import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name)
}
