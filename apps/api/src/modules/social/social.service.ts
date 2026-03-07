import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import {
  Post, PostDocument, PostType, PostVisibility, PostStatus,
  Friendship, FriendshipDocument, FriendshipStatus,
  Group, GroupDocument, GroupPrivacy,
  DirectMessage, DirectMessageDocument,
  Follow, FollowDocument,
} from './schemas/social.schema'

@Injectable()
export class SocialService {
  private readonly logger = new Logger(SocialService.name)

  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    @InjectModel(Friendship.name) private friendshipModel: Model<FriendshipDocument>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
    @InjectModel(DirectMessage.name) private dmModel: Model<DirectMessageDocument>,
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
  ) {}

  // ─── Content Moderation ───────────────────────────────────────────────────

  private sanitizeContent(content: string): string {
    // Basic sanitization — in production, integrate with AI moderation API
    const bannedWords = ['spam', 'inappropriate'] // placeholder list
    let sanitized = content
    bannedWords.forEach(word => {
      sanitized = sanitized.replace(new RegExp(word, 'gi'), '***')
    })
    return sanitized
  }

  private async checkFriendship(userId: string, targetId: string, schoolId: string): Promise<FriendshipDocument | null> {
    return this.friendshipModel.findOne({
      schoolId: new Types.ObjectId(schoolId),
      $or: [
        { requesterId: new Types.ObjectId(userId), recipientId: new Types.ObjectId(targetId) },
        { requesterId: new Types.ObjectId(targetId), recipientId: new Types.ObjectId(userId) },
      ],
      status: FriendshipStatus.ACCEPTED,
    })
  }

  // ─── Posts ────────────────────────────────────────────────────────────────

  async createPost(
    schoolId: string,
    authorId: string,
    dto: {
      type?: PostType
      content?: string
      media?: { url: string; publicId: string; type: string; caption?: string; size?: number }[]
      visibility?: PostVisibility
      groupId?: string
      classId?: string
      tags?: string[]
      taggedUsers?: string[]
      achievementData?: Record<string, unknown>
      expiresAt?: Date
    },
  ): Promise<PostDocument> {
    if (!dto.content && (!dto.media || dto.media.length === 0)) {
      throw new BadRequestException('Post must have content or media')
    }

    const post = new this.postModel({
      ...dto,
      schoolId: new Types.ObjectId(schoolId),
      authorId: new Types.ObjectId(authorId),
      content: dto.content ? this.sanitizeContent(dto.content) : undefined,
      groupId: dto.groupId ? new Types.ObjectId(dto.groupId) : undefined,
      classId: dto.classId ? new Types.ObjectId(dto.classId) : undefined,
      taggedUsers: dto.taggedUsers?.map(id => new Types.ObjectId(id)) || [],
    })

    return post.save()
  }

  async getFeed(
    schoolId: string,
    userId: string,
    options: { page?: number; limit?: number; classId?: string; groupId?: string } = {},
  ): Promise<{ data: PostDocument[]; total: number }> {
    const { page = 1, limit = 20, classId, groupId } = options

    // Get user's friends
    const friendships = await this.friendshipModel.find({
      schoolId: new Types.ObjectId(schoolId),
      $or: [
        { requesterId: new Types.ObjectId(userId) },
        { recipientId: new Types.ObjectId(userId) },
      ],
      status: FriendshipStatus.ACCEPTED,
    })
    const friendIds = friendships.map(f =>
      f.requesterId.toString() === userId ? f.recipientId : f.requesterId,
    )

    // Get followed users
    const follows = await this.followModel.find({
      schoolId: new Types.ObjectId(schoolId),
      followerId: new Types.ObjectId(userId),
    })
    const followingIds = follows.map(f => f.followingId)

    const visibleAuthorIds = [...new Set([...friendIds.map(String), ...followingIds.map(String), userId])]
      .map(id => new Types.ObjectId(id))

    const query: any = {
      schoolId: new Types.ObjectId(schoolId),
      status: PostStatus.ACTIVE,
      isComment: false,
      expiresAt: { $not: { $lt: new Date() } },
      $or: [
        { visibility: PostVisibility.PUBLIC },
        { visibility: PostVisibility.FRIENDS, authorId: { $in: visibleAuthorIds } },
        { visibility: PostVisibility.PRIVATE, authorId: new Types.ObjectId(userId) },
      ],
    }

    if (classId) {
      query.classId = new Types.ObjectId(classId)
      delete query.$or
    }
    if (groupId) {
      query.groupId = new Types.ObjectId(groupId)
      delete query.$or
    }

    const [data, total] = await Promise.all([
      this.postModel
        .find(query)
        .populate('authorId', 'firstName lastName profilePhoto')
        .populate('taggedUsers', 'firstName lastName')
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.postModel.countDocuments(query),
    ])

    return { data, total }
  }

  async getPost(schoolId: string, postId: string): Promise<PostDocument> {
    const post = await this.postModel
      .findOne({ _id: new Types.ObjectId(postId), schoolId: new Types.ObjectId(schoolId), status: PostStatus.ACTIVE })
      .populate('authorId', 'firstName lastName profilePhoto')
      .populate('taggedUsers', 'firstName lastName')

    if (!post) throw new NotFoundException('Post not found')
    return post
  }

  async getComments(schoolId: string, postId: string, page = 1, limit = 20): Promise<PostDocument[]> {
    return this.postModel
      .find({
        schoolId: new Types.ObjectId(schoolId),
        parentPostId: new Types.ObjectId(postId),
        isComment: true,
        status: PostStatus.ACTIVE,
      })
      .populate('authorId', 'firstName lastName profilePhoto')
      .sort({ createdAt: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
  }

  async addComment(schoolId: string, postId: string, authorId: string, content: string): Promise<PostDocument> {
    const post = await this.postModel.findOne({
      _id: new Types.ObjectId(postId),
      schoolId: new Types.ObjectId(schoolId),
      status: PostStatus.ACTIVE,
    })
    if (!post) throw new NotFoundException('Post not found')

    const comment = new this.postModel({
      schoolId: new Types.ObjectId(schoolId),
      authorId: new Types.ObjectId(authorId),
      content: this.sanitizeContent(content),
      type: PostType.TEXT,
      visibility: PostVisibility.PUBLIC,
      parentPostId: new Types.ObjectId(postId),
      isComment: true,
    })

    await comment.save()
    await this.postModel.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } })
    return comment
  }

  async reactToPost(
    schoolId: string,
    postId: string,
    userId: string,
    emoji: string,
  ): Promise<{ likes: number }> {
    const post = await this.postModel.findOne({
      _id: new Types.ObjectId(postId),
      schoolId: new Types.ObjectId(schoolId),
    })
    if (!post) throw new NotFoundException('Post not found')

    const existingReaction = post.reactions.find(r => r.userId.toString() === userId)

    if (existingReaction) {
      if (existingReaction.emoji === emoji) {
        // Remove reaction (toggle)
        await this.postModel.findByIdAndUpdate(postId, {
          $pull: { reactions: { userId: new Types.ObjectId(userId) } },
          $inc: { likesCount: -1 },
        })
      } else {
        // Update reaction emoji
        await this.postModel.findOneAndUpdate(
          { _id: new Types.ObjectId(postId), 'reactions.userId': new Types.ObjectId(userId) },
          { $set: { 'reactions.$.emoji': emoji } },
        )
      }
    } else {
      await this.postModel.findByIdAndUpdate(postId, {
        $push: { reactions: { userId: new Types.ObjectId(userId), emoji, createdAt: new Date() } },
        $inc: { likesCount: 1 },
      })
    }

    const updated = await this.postModel.findById(postId)
    return { likes: updated?.likesCount || 0 }
  }

  async deletePost(schoolId: string, postId: string, userId: string, isAdmin = false): Promise<void> {
    const post = await this.postModel.findOne({
      _id: new Types.ObjectId(postId),
      schoolId: new Types.ObjectId(schoolId),
    })
    if (!post) throw new NotFoundException('Post not found')
    if (!isAdmin && post.authorId.toString() !== userId) throw new ForbiddenException('Cannot delete others\' posts')

    await this.postModel.findByIdAndUpdate(postId, { status: PostStatus.REMOVED })
  }

  async reportPost(schoolId: string, postId: string, reportedBy: string, reason: string): Promise<void> {
    await this.postModel.findOneAndUpdate(
      { _id: new Types.ObjectId(postId), schoolId: new Types.ObjectId(schoolId) },
      {
        $push: { reports: { reportedBy: new Types.ObjectId(reportedBy), reason, createdAt: new Date() } },
        $set: { isFlagged: true },
      },
    )
  }

  async getFlaggedPosts(schoolId: string): Promise<PostDocument[]> {
    return this.postModel
      .find({ schoolId: new Types.ObjectId(schoolId), isFlagged: true, status: PostStatus.ACTIVE })
      .populate('authorId', 'firstName lastName')
      .sort({ createdAt: -1 })
  }

  async moderatePost(schoolId: string, postId: string, action: 'approve' | 'hide' | 'remove'): Promise<PostDocument> {
    const status = action === 'approve' ? PostStatus.ACTIVE : action === 'hide' ? PostStatus.HIDDEN : PostStatus.REMOVED
    const post = await this.postModel.findOneAndUpdate(
      { _id: new Types.ObjectId(postId), schoolId: new Types.ObjectId(schoolId) },
      { $set: { status, isFlagged: false, reports: [] } },
      { new: true },
    )
    if (!post) throw new NotFoundException('Post not found')
    return post
  }

  // ─── Friendships ──────────────────────────────────────────────────────────

  async sendFriendRequest(schoolId: string, requesterId: string, recipientId: string): Promise<FriendshipDocument> {
    if (requesterId === recipientId) throw new BadRequestException('Cannot send friend request to yourself')

    const existing = await this.friendshipModel.findOne({
      schoolId: new Types.ObjectId(schoolId),
      $or: [
        { requesterId: new Types.ObjectId(requesterId), recipientId: new Types.ObjectId(recipientId) },
        { requesterId: new Types.ObjectId(recipientId), recipientId: new Types.ObjectId(requesterId) },
      ],
    })

    if (existing) {
      if (existing.status === FriendshipStatus.BLOCKED) throw new ForbiddenException('User is blocked')
      if (existing.status === FriendshipStatus.ACCEPTED) throw new ConflictException('Already friends')
      if (existing.status === FriendshipStatus.PENDING) throw new ConflictException('Friend request already pending')
    }

    const friendship = new this.friendshipModel({
      schoolId: new Types.ObjectId(schoolId),
      requesterId: new Types.ObjectId(requesterId),
      recipientId: new Types.ObjectId(recipientId),
    })
    return friendship.save()
  }

  async respondToFriendRequest(
    schoolId: string,
    friendshipId: string,
    recipientId: string,
    action: 'accept' | 'decline',
  ): Promise<FriendshipDocument> {
    const friendship = await this.friendshipModel.findOne({
      _id: new Types.ObjectId(friendshipId),
      schoolId: new Types.ObjectId(schoolId),
      recipientId: new Types.ObjectId(recipientId),
      status: FriendshipStatus.PENDING,
    })
    if (!friendship) throw new NotFoundException('Friend request not found')

    friendship.status = action === 'accept' ? FriendshipStatus.ACCEPTED : FriendshipStatus.DECLINED
    friendship.respondedAt = new Date()
    return friendship.save()
  }

  async blockUser(schoolId: string, userId: string, targetId: string, reason?: string): Promise<FriendshipDocument> {
    const existing = await this.friendshipModel.findOne({
      schoolId: new Types.ObjectId(schoolId),
      $or: [
        { requesterId: new Types.ObjectId(userId), recipientId: new Types.ObjectId(targetId) },
        { requesterId: new Types.ObjectId(targetId), recipientId: new Types.ObjectId(userId) },
      ],
    })

    if (existing) {
      existing.status = FriendshipStatus.BLOCKED
      existing.blockedReason = reason
      return existing.save()
    }

    const block = new this.friendshipModel({
      schoolId: new Types.ObjectId(schoolId),
      requesterId: new Types.ObjectId(userId),
      recipientId: new Types.ObjectId(targetId),
      status: FriendshipStatus.BLOCKED,
      blockedReason: reason,
    })
    return block.save()
  }

  async getFriends(schoolId: string, userId: string): Promise<FriendshipDocument[]> {
    return this.friendshipModel
      .find({
        schoolId: new Types.ObjectId(schoolId),
        $or: [
          { requesterId: new Types.ObjectId(userId) },
          { recipientId: new Types.ObjectId(userId) },
        ],
        status: FriendshipStatus.ACCEPTED,
      })
      .populate('requesterId', 'firstName lastName profilePhoto')
      .populate('recipientId', 'firstName lastName profilePhoto')
  }

  async getPendingRequests(schoolId: string, userId: string): Promise<FriendshipDocument[]> {
    return this.friendshipModel
      .find({
        schoolId: new Types.ObjectId(schoolId),
        recipientId: new Types.ObjectId(userId),
        status: FriendshipStatus.PENDING,
      })
      .populate('requesterId', 'firstName lastName profilePhoto')
      .sort({ createdAt: -1 })
  }

  async getFriendSuggestions(schoolId: string, userId: string): Promise<Types.ObjectId[]> {
    // Get friends of friends who aren't already friends
    const friends = await this.getFriends(schoolId, userId)
    const friendIds = friends.map(f =>
      f.requesterId.toString() === userId ? f.recipientId : f.requesterId,
    )

    const mutualFriendships = await this.friendshipModel.find({
      schoolId: new Types.ObjectId(schoolId),
      $or: [
        { requesterId: { $in: friendIds } },
        { recipientId: { $in: friendIds } },
      ],
      status: FriendshipStatus.ACCEPTED,
    })

    const suggestions = new Set<string>()
    mutualFriendships.forEach(f => {
      const id1 = f.requesterId.toString()
      const id2 = f.recipientId.toString()
      if (id1 !== userId && !friendIds.some(fid => fid.toString() === id1)) suggestions.add(id1)
      if (id2 !== userId && !friendIds.some(fid => fid.toString() === id2)) suggestions.add(id2)
    })

    return [...suggestions].slice(0, 10).map(id => new Types.ObjectId(id))
  }

  // ─── Groups ───────────────────────────────────────────────────────────────

  async createGroup(
    schoolId: string,
    createdBy: string,
    dto: {
      name: string
      description?: string
      type?: string
      privacy?: GroupPrivacy
      linkedClassId?: string
      tags?: string[]
    },
  ): Promise<GroupDocument> {
    const group = new this.groupModel({
      ...dto,
      schoolId: new Types.ObjectId(schoolId),
      createdBy: new Types.ObjectId(createdBy),
      linkedClassId: dto.linkedClassId ? new Types.ObjectId(dto.linkedClassId) : undefined,
      members: [{ userId: new Types.ObjectId(createdBy), role: 'admin', joinedAt: new Date() }],
      membersCount: 1,
    })
    return group.save()
  }

  async joinGroup(schoolId: string, groupId: string, userId: string): Promise<GroupDocument> {
    const group = await this.groupModel.findOne({
      _id: new Types.ObjectId(groupId),
      schoolId: new Types.ObjectId(schoolId),
      isActive: true,
    })
    if (!group) throw new NotFoundException('Group not found')
    if (group.privacy === GroupPrivacy.SECRET) throw new ForbiddenException('Cannot join secret group without invite')

    const isMember = group.members.some(m => m.userId.toString() === userId)
    if (isMember) throw new ConflictException('Already a member of this group')

    const updated = await this.groupModel.findByIdAndUpdate(
      groupId,
      {
        $push: { members: { userId: new Types.ObjectId(userId), role: 'member', joinedAt: new Date() } },
        $inc: { membersCount: 1 },
      },
      { new: true },
    )
    return updated!
  }

  async leaveGroup(schoolId: string, groupId: string, userId: string): Promise<void> {
    const group = await this.groupModel.findOne({
      _id: new Types.ObjectId(groupId),
      schoolId: new Types.ObjectId(schoolId),
    })
    if (!group) throw new NotFoundException('Group not found')

    const memberEntry = group.members.find(m => m.userId.toString() === userId)
    if (!memberEntry) throw new BadRequestException('Not a member of this group')
    if (memberEntry.role === 'admin' && group.members.filter(m => m.role === 'admin').length === 1) {
      throw new BadRequestException('Cannot leave group as the only admin')
    }

    await this.groupModel.findByIdAndUpdate(groupId, {
      $pull: { members: { userId: new Types.ObjectId(userId) } },
      $inc: { membersCount: -1 },
    })
  }

  async getGroups(
    schoolId: string,
    userId?: string,
    options: { type?: string; search?: string; page?: number; limit?: number } = {},
  ): Promise<{ data: GroupDocument[]; total: number }> {
    const { type, search, page = 1, limit = 20 } = options
    const query: any = {
      schoolId: new Types.ObjectId(schoolId),
      isActive: true,
      privacy: { $ne: GroupPrivacy.SECRET },
    }
    if (type) query.type = type
    if (search) query.name = new RegExp(search, 'i')
    if (userId) {
      query.$or = [
        { privacy: GroupPrivacy.PUBLIC },
        { 'members.userId': new Types.ObjectId(userId) },
      ]
    }

    const [data, total] = await Promise.all([
      this.groupModel
        .find(query)
        .populate('createdBy', 'firstName lastName')
        .sort({ membersCount: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      this.groupModel.countDocuments(query),
    ])

    return { data, total }
  }

  async getMyGroups(schoolId: string, userId: string): Promise<GroupDocument[]> {
    return this.groupModel
      .find({
        schoolId: new Types.ObjectId(schoolId),
        'members.userId': new Types.ObjectId(userId),
        isActive: true,
      })
      .populate('createdBy', 'firstName lastName')
      .sort({ updatedAt: -1 })
  }

  // ─── Direct Messages ──────────────────────────────────────────────────────

  async sendDirectMessage(
    schoolId: string,
    senderId: string,
    recipientId: string,
    content: string,
    attachments?: { url: string; type: string; name: string }[],
  ): Promise<DirectMessageDocument> {
    // Check for blocks
    const block = await this.friendshipModel.findOne({
      schoolId: new Types.ObjectId(schoolId),
      $or: [
        { requesterId: new Types.ObjectId(senderId), recipientId: new Types.ObjectId(recipientId), status: FriendshipStatus.BLOCKED },
        { requesterId: new Types.ObjectId(recipientId), recipientId: new Types.ObjectId(senderId), status: FriendshipStatus.BLOCKED },
      ],
    })
    if (block) throw new ForbiddenException('Cannot send message to this user')

    const message = new this.dmModel({
      schoolId: new Types.ObjectId(schoolId),
      senderId: new Types.ObjectId(senderId),
      recipientId: new Types.ObjectId(recipientId),
      content: this.sanitizeContent(content),
      attachments: attachments || [],
    })
    return message.save()
  }

  async getConversation(
    schoolId: string,
    userId1: string,
    userId2: string,
    page = 1,
    limit = 50,
  ): Promise<DirectMessageDocument[]> {
    // Mark messages as read
    await this.dmModel.updateMany(
      {
        schoolId: new Types.ObjectId(schoolId),
        senderId: new Types.ObjectId(userId2),
        recipientId: new Types.ObjectId(userId1),
        isRead: false,
      },
      { $set: { isRead: true, readAt: new Date() } },
    )

    return this.dmModel
      .find({
        schoolId: new Types.ObjectId(schoolId),
        isDeleted: false,
        $or: [
          { senderId: new Types.ObjectId(userId1), recipientId: new Types.ObjectId(userId2) },
          { senderId: new Types.ObjectId(userId2), recipientId: new Types.ObjectId(userId1) },
        ],
      })
      .populate('senderId', 'firstName lastName profilePhoto')
      .populate('replyTo', 'content senderId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
  }

  async getInbox(schoolId: string, userId: string): Promise<Record<string, unknown>[]> {
    // Get latest message per conversation
    return this.dmModel.aggregate([
      {
        $match: {
          schoolId: new Types.ObjectId(schoolId),
          isDeleted: false,
          $or: [
            { senderId: new Types.ObjectId(userId) },
            { recipientId: new Types.ObjectId(userId) },
          ],
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: {
            $cond: [
              { $lt: ['$senderId', '$recipientId'] },
              { user1: '$senderId', user2: '$recipientId' },
              { user1: '$recipientId', user2: '$senderId' },
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ['$recipientId', new Types.ObjectId(userId)] }, { $eq: ['$isRead', false] }] }, 1, 0],
            },
          },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1 } },
      { $limit: 30 },
    ])
  }

  async getUnreadCount(schoolId: string, userId: string): Promise<number> {
    return this.dmModel.countDocuments({
      schoolId: new Types.ObjectId(schoolId),
      recipientId: new Types.ObjectId(userId),
      isRead: false,
      isDeleted: false,
    })
  }

  // ─── Following ────────────────────────────────────────────────────────────

  async follow(schoolId: string, followerId: string, followingId: string): Promise<FollowDocument> {
    if (followerId === followingId) throw new BadRequestException('Cannot follow yourself')
    const existing = await this.followModel.findOne({
      schoolId: new Types.ObjectId(schoolId),
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    })
    if (existing) throw new ConflictException('Already following')

    return new this.followModel({
      schoolId: new Types.ObjectId(schoolId),
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    }).save()
  }

  async unfollow(schoolId: string, followerId: string, followingId: string): Promise<void> {
    await this.followModel.findOneAndDelete({
      schoolId: new Types.ObjectId(schoolId),
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    })
  }

  async getFollowers(schoolId: string, userId: string): Promise<FollowDocument[]> {
    return this.followModel
      .find({ schoolId: new Types.ObjectId(schoolId), followingId: new Types.ObjectId(userId) })
      .populate('followerId', 'firstName lastName profilePhoto')
  }

  async getFollowing(schoolId: string, userId: string): Promise<FollowDocument[]> {
    return this.followModel
      .find({ schoolId: new Types.ObjectId(schoolId), followerId: new Types.ObjectId(userId) })
      .populate('followingId', 'firstName lastName profilePhoto')
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  async getSocialStats(schoolId: string): Promise<Record<string, unknown>> {
    const [totalPosts, totalGroups, flaggedPosts, activeUsers] = await Promise.all([
      this.postModel.countDocuments({ schoolId: new Types.ObjectId(schoolId), status: PostStatus.ACTIVE, isComment: false }),
      this.groupModel.countDocuments({ schoolId: new Types.ObjectId(schoolId), isActive: true }),
      this.postModel.countDocuments({ schoolId: new Types.ObjectId(schoolId), isFlagged: true, status: PostStatus.ACTIVE }),
      this.postModel.aggregate([
        { $match: { schoolId: new Types.ObjectId(schoolId), createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: '$authorId' } },
        { $count: 'total' },
      ]),
    ])

    return {
      totalPosts,
      totalGroups,
      flaggedPosts,
      activeUsersThisWeek: activeUsers[0]?.total || 0,
    }
  }

  async getUserProfile(
    schoolId: string,
    targetUserId: string,
    viewerId: string,
  ): Promise<Record<string, unknown>> {
    const [posts, friendsCount, followersCount, followingCount, isFriend, isFollowing] = await Promise.all([
      this.postModel.countDocuments({
        schoolId: new Types.ObjectId(schoolId),
        authorId: new Types.ObjectId(targetUserId),
        status: PostStatus.ACTIVE,
        isComment: false,
      }),
      this.friendshipModel.countDocuments({
        schoolId: new Types.ObjectId(schoolId),
        $or: [
          { requesterId: new Types.ObjectId(targetUserId) },
          { recipientId: new Types.ObjectId(targetUserId) },
        ],
        status: FriendshipStatus.ACCEPTED,
      }),
      this.followModel.countDocuments({
        schoolId: new Types.ObjectId(schoolId),
        followingId: new Types.ObjectId(targetUserId),
      }),
      this.followModel.countDocuments({
        schoolId: new Types.ObjectId(schoolId),
        followerId: new Types.ObjectId(targetUserId),
      }),
      this.checkFriendship(viewerId, targetUserId, schoolId),
      this.followModel.findOne({
        schoolId: new Types.ObjectId(schoolId),
        followerId: new Types.ObjectId(viewerId),
        followingId: new Types.ObjectId(targetUserId),
      }),
    ])

    return { posts, friendsCount, followersCount, followingCount, isFriend: !!isFriend, isFollowing: !!isFollowing }
  }
}
