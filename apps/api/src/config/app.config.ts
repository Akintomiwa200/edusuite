import { registerAs } from '@nestjs/config'

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME || 'EduSuite',
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  rateLimit: {
    short: parseInt(process.env.RATE_LIMIT_SHORT || '10', 10),
    medium: parseInt(process.env.RATE_LIMIT_MEDIUM || '50', 10),
    long: parseInt(process.env.RATE_LIMIT_LONG || '200', 10),
  },
}))

export const dbConfig = registerAs('db', () => ({
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017',
  dbName: process.env.DB_NAME || 'edusuite',
}))

export const jwtConfig = registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'super-secret-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh-super-secret-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
}))

export const cloudinaryConfig = registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  folders: {
    profiles: 'edusuite/profiles',
    assignments: 'edusuite/assignments',
    submissions: 'edusuite/submissions',
    results: 'edusuite/results',
    social: 'edusuite/social',
    leave: 'edusuite/leave-docs',
    books: 'edusuite/library',
    recordings: 'edusuite/recordings',
    proctoring: 'edusuite/proctoring',
    school: 'edusuite/school',
  },
}))

export const redisConfig = registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  ttl: parseInt(process.env.REDIS_TTL || '3600', 10),
}))

export const aiConfig = registerAs('ai', () => ({
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',
  webrtcPublicIp: process.env.WEBRTC_PUBLIC_IP || '127.0.0.1',
  webrtcMinPort: parseInt(process.env.WEBRTC_MIN_PORT || '40000', 10),
  webrtcMaxPort: parseInt(process.env.WEBRTC_MAX_PORT || '49999', 10),
}))
