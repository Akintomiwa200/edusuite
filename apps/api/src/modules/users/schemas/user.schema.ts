import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'
import { UserRole } from '@edusuite/shared-types'

export type UserDocument = User & Document

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, trim: true, lowercase: true, unique: true, index: true })
  email: string

  @Prop({ required: true, select: false })
  password: string

  @Prop({ required: true, trim: true })
  firstName: string

  @Prop({ required: true, trim: true })
  lastName: string

  @Prop({ required: true, enum: Object.values(UserRole), index: true })
  role: UserRole

  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Branch', index: true })
  branchId?: Types.ObjectId

  @Prop({ trim: true })
  phone?: string

  @Prop()
  profilePicture?: string

  @Prop()
  cloudinaryPublicId?: string

  @Prop({ default: true, index: true })
  isActive: boolean

  @Prop({ default: false })
  isEmailVerified: boolean

  @Prop()
  lastLogin?: Date

  @Prop({ type: [String], default: [] })
  deviceTokens: string[]

  @Prop({
    type: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'Africa/Lagos' },
    },
    default: {},
  })
  settings: {
    notifications: { email: boolean; push: boolean; sms: boolean }
    theme: 'light' | 'dark' | 'system'
    language: string
    timezone: string
  }
}

export const UserSchema = SchemaFactory.createForClass(User)

// Virtual: full name
UserSchema.virtual('fullName').get(function (this: UserDocument) {
  return `${this.firstName} ${this.lastName}`
})

// Index for search
UserSchema.index({ firstName: 'text', lastName: 'text', email: 'text' })
UserSchema.index({ schoolId: 1, role: 1, isActive: 1 })
UserSchema.index({ branchId: 1, role: 1 })
