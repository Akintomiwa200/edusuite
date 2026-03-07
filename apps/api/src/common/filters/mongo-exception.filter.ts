import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus, Logger } from '@nestjs/common'
import { Response, Request } from 'express'
import { MongoError } from 'mongodb'
import { Error as MongooseError } from 'mongoose'

@Catch(MongoError, MongooseError)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name)

  catch(exception: MongoError | MongooseError, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message = 'Database error'
    let errors: Record<string, string> | undefined

    if (exception instanceof MongoError) {
      if (exception.code === 11000) {
        status = HttpStatus.CONFLICT
        const keyValue = (exception as any).keyValue
        const field = Object.keys(keyValue || {})[0]
        message = `${field ? `'${field}'` : 'A record'} already exists with that value`
      }
    } else if (exception instanceof MongooseError.ValidationError) {
      status = HttpStatus.BAD_REQUEST
      message = 'Validation failed'
      errors = Object.keys(exception.errors).reduce(
        (acc, key) => {
          acc[key] = exception.errors[key].message
          return acc
        },
        {} as Record<string, string>,
      )
    } else if (exception instanceof MongooseError.CastError) {
      status = HttpStatus.BAD_REQUEST
      message = `Invalid value for field '${exception.path}'`
    }

    this.logger.error(`MongoDB error: ${exception.message}`, exception.stack)

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
      ...(errors && { errors }),
    })
  }
}
