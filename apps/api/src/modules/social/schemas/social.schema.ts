import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Types } from 'mongoose'

// ─── Post Schema ──────────────────────────────────────────────────────────────

export type PostDocument = Post & Document

export enum PostType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
  ACHIEVEMENT = 'achievement',
  ANNOUNCEMENT = 'announcement',
  STORY = 'story',
}

export enum PostVisibility {
  PUBLIC = 'public',          // Everyone in school
  FRIENDS = 'friends',        // Friends only
  CLASS = 'class',            // Class members only
  GROUP = 'group',            // Group members only
  PRIVATE = 'private',        // Only me
}

export enum PostStatus {
  ACTIVE = 'active',
  HIDDEN = 'hidden',          // Hidden by moderation
  REMOVED = 'removed',
  ARCHIVED = 'archived',
}

@Schema({ timestamps: true, collection: 'social_posts' })
export class Post {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  authorId: Types.ObjectId

  @Prop({ enum: Object.values(PostType), default: PostType.TEXT })
  type: PostType

  @Prop({ trim: true, maxlength: 5000 })
  content?: string

  @Prop({
    type: [{
      url: String,
      publicId: String,
      type: { type: String, enum: ['image', 'video', 'document'] },
      caption: String,
      size: Number,
    }],
    default: [],
  })
  media: { url: string; publicId: string; type: string; caption?: string; size?: number }[]

  @Prop({ enum: Object.values(PostVisibility), default: PostVisibility.PUBLIC })
  visibility: PostVisibility

  @Prop({ type: Types.ObjectId, ref: 'Group' })
  groupId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Class' })
  classId?: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'Post' })
  parentPostId?: Types.ObjectId // for comments/replies

  @Prop({ default: false })
  isComment: boolean

  @Prop({ default: 0 })
  likesCount: number

  @Prop({ default: 0 })
  commentsCount: number

  @Prop({ default: 0 })
  sharesCount: number

  @Prop({ type: [{ userId: Types.ObjectId, emoji: String, createdAt: Date }], default: [] })
  reactions: { userId: Types.ObjectId; emoji: string; createdAt: Date }[]

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  taggedUsers: Types.ObjectId[]

  @Prop({ default: false })
  isPinned: boolean

  @Prop({ default: false })
  isFlagged: boolean

  @Prop({ type: [{ reportedBy: Types.ObjectId, reason: String, createdAt: Date }], default: [] })
  reports: { reportedBy: Types.ObjectId; reason: string; createdAt: Date }[]

  @Prop({ enum: Object.values(PostStatus), default: PostStatus.ACTIVE, index: true })
  status: PostStatus

  @Prop({ type: Object })
  achievementData?: {
    type: string
    title: string
    description: string
    badgeUrl?: string
    points?: number
  }

  // Story-specific
  @Prop()
  expiresAt?: Date
}

export const PostSchema = SchemaFactory.createForClass(Post)
PostSchema.index({ schoolId: 1, authorId: 1, createdAt: -1 })
PostSchema.index({ schoolId: 1, classId: 1, createdAt: -1 })
PostSchema.index({ schoolId: 1, groupId: 1, createdAt: -1 })
PostSchema.index({ schoolId: 1, parentPostId: 1, isComment: 1 })
PostSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }) // TTL for stories

// ─── Friendship Schema ────────────────────────────────────────────────────────

export type FriendshipDocument = Friendship & Document

export enum FriendshipStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  BLOCKED = 'blocked',
}

@Schema({ timestamps: true, collection: 'friendships' })
export class Friendship {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  requesterId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  recipientId: Types.ObjectId

  @Prop({ enum: Object.values(FriendshipStatus), default: FriendshipStatus.PENDING, index: true })
  status: FriendshipStatus

  @Prop()
  respondedAt?: Date

  @Prop()
  blockedReason?: string
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship)
FriendshipSchema.index({ requesterId: 1, recipientId: 1, schoolId: 1 }, { unique: true })
FriendshipSchema.index({ recipientId: 1, status: 1 })

// ─── Group Schema ─────────────────────────────────────────────────────────────

export type GroupDocument = Group & Document

export enum GroupType {
  CLASS = 'class',
  CLUB = 'club',
  STUDY = 'study',
  SPORTS = 'sports',
  CUSTOM = 'custom',
}

export enum GroupPrivacy {
  PUBLIC = 'public',
  PRIVATE = 'private',
  SECRET = 'secret',
}

@Schema({ timestamps: true, collection: 'social_groups' })
export class Group {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ required: true, trim: true })
  name: string

  @Prop({ trim: true })
  description?: string

  @Prop()
  coverImage?: string

  @Prop({ enum: Object.values(GroupType), default: GroupType.CUSTOM })
  type: GroupType

  @Prop({ enum: Object.values(GroupPrivacy), default: GroupPrivacy.PUBLIC })
  privacy: GroupPrivacy

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId

  @Prop({
    type: [{
      userId: { type: Types.ObjectId, ref: 'User' },
      role: { type: String, enum: ['admin', 'moderator', 'member'], default: 'member' },
      joinedAt: { type: Date, default: Date.now },
    }],
    default: [],
  })
  members: { userId: Types.ObjectId; role: string; joinedAt: Date }[]

  @Prop({ default: 0 })
  membersCount: number

  @Prop({ default: 0 })
  postsCount: number

  @Prop({ default: true })
  isActive: boolean

  @Prop({ type: Types.ObjectId, ref: 'Class' })
  linkedClassId?: Types.ObjectId

  @Prop({ type: [String], default: [] })
  tags: string[]

  @Prop({ type: Object, default: {} })
  settings: {
    allowMemberPosts?: boolean
    requireApproval?: boolean
    allowInvites?: boolean
  }
}

export const GroupSchema = SchemaFactory.createForClass(Group)
GroupSchema.index({ schoolId: 1, type: 1 })
GroupSchema.index({ schoolId: 1, 'members.userId': 1 })

// ─── Direct Message Schema ────────────────────────────────────────────────────

export type DirectMessageDocument = DirectMessage & Document

@Schema({ timestamps: true, collection: 'direct_messages' })
export class DirectMessage {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true, index: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  senderId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipientId: Types.ObjectId

  @Prop({ trim: true, maxlength: 2000 })
  content?: string

  @Prop({ type: [{ url: String, type: String, name: String }], default: [] })
  attachments: { url: string; type: string; name: string }[]

  @Prop({ default: false })
  isRead: boolean

  @Prop()
  readAt?: Date

  @Prop({ default: false })
  isDeleted: boolean

  @Prop({ type: Types.ObjectId, ref: 'DirectMessage' })
  replyTo?: Types.ObjectId

  @Prop({ default: false })
  isFlagged: boolean

  @Prop({ enum: ['text', 'voice', 'image', 'file', 'system'], default: 'text' })
  messageType: string
}

export const DirectMessageSchema = SchemaFactory.createForClass(DirectMessage)
DirectMessageSchema.index({ senderId: 1, recipientId: 1, createdAt: -1 })
DirectMessageSchema.index({ schoolId: 1, recipientId: 1, isRead: 1 })

// ─── Following Schema ─────────────────────────────────────────────────────────

export type FollowDocument = Follow & Document

@Schema({ timestamps: true, collection: 'follows' })
export class Follow {
  @Prop({ type: Types.ObjectId, ref: 'School', required: true })
  schoolId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  followerId: Types.ObjectId

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  followingId: Types.ObjectId
}

export const FollowSchema = SchemaFactory.createForClass(Follow)
FollowSchema.index({ followerId: 1, followingId: 1, schoolId: 1 }, { unique: true })
