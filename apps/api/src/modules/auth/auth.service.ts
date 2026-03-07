import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import * as bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { AuthTokens, AuthPayload, UserRole } from '@edusuite/shared-types'
import { UsersService } from '../users/users.service'
import { NotificationsService } from '../notifications/notifications.service'
import { RefreshToken } from './schemas/refresh-token.schema'
import { OtpRecord } from './schemas/otp.schema'
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import { ResetPasswordDto } from './dto/reset-password.dto'
import { ChangePasswordDto } from './dto/change-password.dto'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
    @InjectModel(OtpRecord.name) private otpModel: Model<OtpRecord>,
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
    private notificationsService: NotificationsService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) throw new UnauthorizedException('Invalid credentials')
    if (!user.isActive) throw new UnauthorizedException('Account is deactivated')
    if (!user.isEmailVerified) throw new UnauthorizedException('Please verify your email')

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) throw new UnauthorizedException('Invalid credentials')

    return user
  }

  async login(loginDto: LoginDto): Promise<{ tokens: AuthTokens; user: Record<string, unknown> }> {
    const user = await this.validateUser(loginDto.email, loginDto.password)

    // Update device token if provided
    if (loginDto.deviceToken) {
      await this.usersService.addDeviceToken(user._id.toString(), loginDto.deviceToken)
    }

    // Update last login
    await this.usersService.updateLastLogin(user._id.toString())

    const tokens = await this.generateTokens(user)

    const { password: _, ...userWithoutPassword } = user.toObject()
    return { tokens, user: userWithoutPassword }
  }

  async register(registerDto: RegisterDto) {
    const existing = await this.usersService.findByEmail(registerDto.email)
    if (existing) throw new ConflictException('Email already in use')

    const hashedPassword = await bcrypt.hash(registerDto.password, 12)
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    })

    // Send email verification OTP
    const otp = await this.generateOtp(user._id.toString(), 'EMAIL_VERIFICATION')
    await this.notificationsService.sendEmailVerificationOtp(user.email, user.firstName, otp)

    const { password: _, ...userWithoutPassword } = user.toObject()
    return { message: 'Registration successful. Please verify your email.', user: userWithoutPassword }
  }

  async verifyEmail(userId: string, otp: string) {
    const otpRecord = await this.otpModel.findOne({
      userId,
      purpose: 'EMAIL_VERIFICATION',
      otp,
      expiresAt: { $gt: new Date() },
      used: false,
    })

    if (!otpRecord) throw new BadRequestException('Invalid or expired OTP')

    await this.usersService.markEmailVerified(userId)
    await this.otpModel.findByIdAndUpdate(otpRecord._id, { used: true })

    return { message: 'Email verified successfully' }
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    let payload: AuthPayload
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      })
    } catch {
      throw new UnauthorizedException('Invalid refresh token')
    }

    // Check if refresh token exists in DB (rotation)
    const tokenRecord = await this.refreshTokenModel.findOne({
      token: refreshToken,
      userId: payload.sub,
      expiresAt: { $gt: new Date() },
      revoked: false,
    })

    if (!tokenRecord) throw new UnauthorizedException('Refresh token revoked or expired')

    const user = await this.usersService.findById(payload.sub)
    if (!user || !user.isActive) throw new UnauthorizedException('User not found or inactive')

    // Rotate: revoke old, issue new
    await this.refreshTokenModel.findByIdAndUpdate(tokenRecord._id, { revoked: true })
    return this.generateTokens(user)
  }

  async logout(userId: string, refreshToken?: string) {
    if (refreshToken) {
      await this.refreshTokenModel.findOneAndUpdate(
        { userId, token: refreshToken },
        { revoked: true },
      )
    } else {
      // Revoke all tokens for this user
      await this.refreshTokenModel.updateMany({ userId, revoked: false }, { revoked: true })
    }
    return { message: 'Logged out successfully' }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email)
    // Always return success to prevent email enumeration
    if (!user) return { message: 'If the email exists, a reset link has been sent' }

    const otp = await this.generateOtp(user._id.toString(), 'PASSWORD_RESET')
    await this.notificationsService.sendPasswordResetOtp(user.email, user.firstName, otp)

    return { message: 'If the email exists, a reset link has been sent' }
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email)
    if (!user) throw new NotFoundException('User not found')

    const otpRecord = await this.otpModel.findOne({
      userId: user._id.toString(),
      purpose: 'PASSWORD_RESET',
      otp: dto.otp,
      expiresAt: { $gt: new Date() },
      used: false,
    })

    if (!otpRecord) throw new BadRequestException('Invalid or expired OTP')

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12)
    await this.usersService.updatePassword(user._id.toString(), hashedPassword)
    await this.otpModel.findByIdAndUpdate(otpRecord._id, { used: true })

    // Revoke all refresh tokens
    await this.refreshTokenModel.updateMany(
      { userId: user._id.toString(), revoked: false },
      { revoked: true },
    )

    return { message: 'Password reset successfully' }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.usersService.findById(userId)
    if (!user) throw new NotFoundException('User not found')

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password)
    if (!isMatch) throw new BadRequestException('Current password is incorrect')

    const hashedPassword = await bcrypt.hash(dto.newPassword, 12)
    await this.usersService.updatePassword(userId, hashedPassword)

    // Revoke all refresh tokens to force re-login on all devices
    await this.refreshTokenModel.updateMany({ userId, revoked: false }, { revoked: true })

    return { message: 'Password changed successfully' }
  }

  async resendOtp(email: string, purpose: string) {
    const user = await this.usersService.findByEmail(email)
    if (!user) return { message: 'OTP sent if account exists' }

    const otp = await this.generateOtp(user._id.toString(), purpose)

    if (purpose === 'EMAIL_VERIFICATION') {
      await this.notificationsService.sendEmailVerificationOtp(user.email, user.firstName, otp)
    } else if (purpose === 'PASSWORD_RESET') {
      await this.notificationsService.sendPasswordResetOtp(user.email, user.firstName, otp)
    }

    return { message: 'OTP sent if account exists' }
  }

  // ──────────────────────────────────────────
  // Private helpers
  // ──────────────────────────────────────────

  private async generateTokens(user: any): Promise<AuthTokens> {
    const payload: Omit<AuthPayload, 'iat' | 'exp'> = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role as UserRole,
      schoolId: user.schoolId?.toString(),
      branchId: user.branchId?.toString(),
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.secret'),
        expiresIn: this.config.get<string>('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: this.config.get<string>('jwt.refreshExpiresIn'),
      }),
    ])

    // Store refresh token in DB for rotation/revocation
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    await this.refreshTokenModel.create({
      userId: user._id.toString(),
      token: refreshToken,
      expiresAt,
      revoked: false,
    })

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    }
  }

  private async generateOtp(userId: string, purpose: string): Promise<string> {
    // Invalidate existing OTPs for same purpose
    await this.otpModel.updateMany(
      { userId, purpose, used: false },
      { used: true },
    )

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    await this.otpModel.create({ userId, otp, purpose, expiresAt, used: false })
    return otp
  }
}
