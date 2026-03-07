import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { GraphQLModule } from '@nestjs/graphql'
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { ThrottlerModule } from '@nestjs/throttler'
import { ScheduleModule } from '@nestjs/schedule'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { BullModule } from '@nestjs/bull'
import { TerminusModule } from '@nestjs/terminus'
import { join } from 'path'

import { appConfig } from './config/app.config'
import { dbConfig } from './config/db.config'
import { jwtConfig } from './config/jwt.config'
import { cloudinaryConfig } from './config/cloudinary.config'
import { redisConfig } from './config/redis.config'
import { aiConfig } from './config/ai.config'

import { AuthModule } from './modules/auth/auth.module'
import { UsersModule } from './modules/users/users.module'
import { SchoolsModule } from './modules/schools/schools.module'
import { StudentsModule } from './modules/students/students.module'
import { TeachersModule } from './modules/teachers/teachers.module'
import { ParentsModule } from './modules/parents/parents.module'
import { AcademicModule } from './modules/academic/academic.module'
import { AttendanceModule } from './modules/attendance/attendance.module'
import { FinancialModule } from './modules/financial/financial.module'
import { HrModule } from './modules/hr/hr.module'
import { ExamsModule } from './modules/exams/exams.module'
import { AssignmentsModule } from './modules/assignments/assignments.module'
import { LiveClassModule } from './modules/live-class/live-class.module'
import { SocialModule } from './modules/social/social.module'
import { NotificationsModule } from './modules/notifications/notifications.module'
import { AiModule } from './modules/ai/ai.module'
import { LibraryModule } from './modules/library/library.module'
import { TransportModule } from './modules/transport/transport.module'
import { DashboardModule } from './modules/dashboard/dashboard.module'
import { HealthModule } from './modules/health/health.module'
import { MetricsModule } from './modules/metrics/metrics.module'

// New modules from PRD v2.5
import { LeaveModule } from './modules/leave/leave.module'
import { HealthMedicalModule } from './modules/health-medical/healthmedical.module'
import { InventoryModule } from './modules/inventory/inventory.module'
import { HostelModule } from './modules/hostel/hostel.module'
import { SportsModule } from './modules/sports/sports.module'
import { EventsModule } from './modules/events/events.module'
import { CafeteriaModule } from './modules/cafeteria/cafeteria.module'
import { MaintenanceModule } from './modules/maintenance/maintenance.module'
import { IctSupportModule } from './modules/ict-support/ictsupport.module'
import { SecurityModule } from './modules/security/security.module'
import { AlumniModule } from './modules/alumni/alumni.module'
import { AdmissionsModule } from './modules/admissions/admissions.module'
import { PayrollModule } from './modules/payroll/payroll.module'
import { GamificationModule } from './modules/gamification/gamification.module'
import { CommunicationModule } from './modules/communication/communication.module'
import { AuditLogModule } from './modules/audit-logs/auditlog.module'

@Module({
  imports: [
    // Configuration - loads env & validates schema
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, jwtConfig, cloudinaryConfig, redisConfig, aiConfig],
      cache: true,
    }),

    // MongoDB via Mongoose
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('db.mongoUri'),
        dbName: config.get<string>('db.dbName'),
        connectionFactory: (connection) => {
          // Register global plugins here if needed
          return connection
        },
      }),
    }),

    // GraphQL
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: process.env.NODE_ENV !== 'production',
      introspection: process.env.NODE_ENV !== 'production',
      context: ({ req, res }) => ({ req, res }),
      subscriptions: {
        'graphql-ws': true,
        'subscriptions-transport-ws': true,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          name: 'short',
          ttl: 1000,
          limit: config.get<number>('app.rateLimit.short', 10),
        },
        {
          name: 'medium',
          ttl: 10000,
          limit: config.get<number>('app.rateLimit.medium', 50),
        },
        {
          name: 'long',
          ttl: 60000,
          limit: config.get<number>('app.rateLimit.long', 200),
        },
      ],
    }),

    // Task scheduling
    ScheduleModule.forRoot(),

    // Event emitter
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      ignoreErrors: false,
    }),

    // Bull queue (backed by Redis)
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        redis: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
          password: config.get<string>('redis.password'),
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
        },
      }),
    }),

    // Health checks
    TerminusModule,

    // Feature modules
    AuthModule,
    UsersModule,
    SchoolsModule,
    StudentsModule,
    TeachersModule,
    ParentsModule,
    AcademicModule,
    AttendanceModule,
    FinancialModule,
    HrModule,
    ExamsModule,
    AssignmentsModule,
    LiveClassModule,
    SocialModule,
    NotificationsModule,
    AiModule,
    LibraryModule,
    TransportModule,
    DashboardModule,
    HealthModule,
    MetricsModule,

    // New modules from PRD v2.5
    LeaveModule,
    HealthMedicalModule,
    InventoryModule,
    HostelModule,
    SportsModule,
    EventsModule,
    CafeteriaModule,
    MaintenanceModule,
    IctSupportModule,
    SecurityModule,
    AlumniModule,
    AdmissionsModule,
    PayrollModule,
    GamificationModule,
    CommunicationModule,
    AuditLogModule,
  ],
})
export class AppModule {}
