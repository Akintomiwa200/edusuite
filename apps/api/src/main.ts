import { NestFactory } from '@nestjs/core'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import compression from 'compression'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TransformInterceptor } from './common/interceptors/transform.interceptor'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
    cors: false,
  })

  // Trust proxy for Kubernetes/load balancer
  app.set('trust proxy', 1)

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", 'wss:', 'https:'],
          mediaSrc: ["'self'", 'blob:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    }),
  )

  // Compression
  app.use(compression())

  // CORS
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID', 'X-Branch-ID'],
  })

  // Global prefix and versioning
  app.setGlobalPrefix('api')
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  )

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter())

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor(), new TransformInterceptor())

  // Swagger documentation
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('EduSuite API')
      .setDescription('Complete School Management Ecosystem API')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('users', 'User management')
      .addTag('schools', 'School & branch management')
      .addTag('students', 'Student management')
      .addTag('teachers', 'Teacher management')
      .addTag('academic', 'Academic management')
      .addTag('attendance', 'Attendance tracking')
      .addTag('financial', 'Fees & payroll')
      .addTag('hr', 'HR & leave management')
      .addTag('exams', 'Exams & results')
      .addTag('assignments', 'Assignments & submissions')
      .addTag('live-class', 'Live classes & WebRTC')
      .addTag('social', 'Social features')
      .addTag('notifications', 'Notifications')
      .addTag('ai', 'AI features')
      .addTag('library', 'Library management')
      .addTag('transport', 'Transport management')
      .addTag('dashboard', 'Dashboard & analytics')
      .build()

    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('api/docs', app, document, {
      swaggerOptions: { persistAuthorization: true },
    })
  }

  const port = process.env.PORT || 4000
  await app.listen(port)

  console.log(`
  ╔══════════════════════════════════════════╗
  ║        EduSuite API v3.0 Running         ║
  ║  Server: http://localhost:${port}           ║
  ║  Docs:   http://localhost:${port}/api/docs  ║
  ╚══════════════════════════════════════════╝
  `)
}

bootstrap()
