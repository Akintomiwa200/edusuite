import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class AdmissionsService {
  private readonly logger = new Logger(AdmissionsService.name)
}
