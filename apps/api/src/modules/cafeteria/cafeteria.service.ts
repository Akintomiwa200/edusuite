import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class CafeteriaService {
  private readonly logger = new Logger(CafeteriaService.name)
}
