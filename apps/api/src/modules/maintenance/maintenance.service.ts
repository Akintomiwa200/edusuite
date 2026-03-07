import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name)
}
