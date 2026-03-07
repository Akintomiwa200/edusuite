import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class HealthMedicalService {
  private readonly logger = new Logger(HealthMedicalService.name)
}
