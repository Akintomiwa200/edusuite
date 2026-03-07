import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class PayrollService {
  private readonly logger = new Logger(PayrollService.name)
}
