import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const { method, url, user } = request
    const userInfo = user ? `[${user.role}:${user._id}]` : '[anonymous]'
    const start = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse()
          const ms = Date.now() - start
          this.logger.log(`${method} ${url} ${response.statusCode} ${ms}ms ${userInfo}`)
        },
        error: (err) => {
          const ms = Date.now() - start
          this.logger.error(`${method} ${url} ${err.status || 500} ${ms}ms ${userInfo} - ${err.message}`)
        },
      }),
    )
  }
}
