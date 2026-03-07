import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name)
}
