import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  timestamp: string
  path?: string
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const request = context.switchToHttp().getRequest()

    return next.handle().pipe(
      map((data) => {
        // If the handler already returned a structured response, pass through
        if (data && typeof data === 'object' && 'success' in data) return data

        return {
          success: true,
          data: data?.data !== undefined ? data.data : data,
          message: data?.message,
          timestamp: new Date().toISOString(),
          path: request.url,
          ...(data?.pagination && { pagination: data.pagination }),
          ...(data?.meta && { meta: data.meta }),
        }
      }),
    )
  }
}
