import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { SocialService } from './social.service'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles, CurrentUser, SchoolId } from '../../common/decorators/roles.decorator'
import { UserRole } from '@edusuite/shared-types'

@ApiTags('Social')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  // ─── Feed & Posts ─────────────────────────────────────────────────────────

  @Get('feed')
  @ApiOperation({ summary: 'Get personalized social feed' })
  getFeed(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('classId') classId?: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.socialService.getFeed(schoolId, userId, { page, limit, classId, groupId })
  }

  @Post('posts')
  @ApiOperation({ summary: 'Create a new post' })
  createPost(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: any,
  ) {
    return this.socialService.createPost(schoolId, userId, dto)
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get a single post' })
  getPost(@SchoolId() schoolId: string, @Param('id') id: string) {
    return this.socialService.getPost(schoolId, id)
  }

  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Get comments for a post' })
  getComments(
    @SchoolId() schoolId: string,
    @Param('id') id: string,
    @Query('page') page?: number,
  ) {
    return this.socialService.getComments(schoolId, id, page)
  }

  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Comment on a post' })
  addComment(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() body: { content: string },
  ) {
    return this.socialService.addComment(schoolId, id, userId, body.content)
  }

  @Post('posts/:id/react')
  @ApiOperation({ summary: 'React to a post' })
  reactToPost(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() body: { emoji: string },
  ) {
    return this.socialService.reactToPost(schoolId, id, userId, body.emoji)
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post' })
  deletePost(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.socialService.deletePost(schoolId, id, userId)
  }

  @Post('posts/:id/report')
  @ApiOperation({ summary: 'Report a post' })
  reportPost(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    return this.socialService.reportPost(schoolId, id, userId, body.reason)
  }

  // ─── Moderation (Admin only) ──────────────────────────────────────────────

  @Get('moderation/flagged')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get flagged posts for moderation' })
  getFlaggedPosts(@SchoolId() schoolId: string) {
    return this.socialService.getFlaggedPosts(schoolId)
  }

  @Patch('moderation/posts/:id')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.TEACHER, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Moderate a post' })
  moderatePost(
    @SchoolId() schoolId: string,
    @Param('id') id: string,
    @Body() body: { action: 'approve' | 'hide' | 'remove' },
  ) {
    return this.socialService.moderatePost(schoolId, id, body.action)
  }

  // ─── Friends ──────────────────────────────────────────────────────────────

  @Post('friends/request')
  @ApiOperation({ summary: 'Send friend request' })
  sendFriendRequest(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() body: { recipientId: string },
  ) {
    return this.socialService.sendFriendRequest(schoolId, userId, body.recipientId)
  }

  @Patch('friends/request/:id')
  @ApiOperation({ summary: 'Accept or decline friend request' })
  respondToRequest(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
    @Body() body: { action: 'accept' | 'decline' },
  ) {
    return this.socialService.respondToFriendRequest(schoolId, id, userId, body.action)
  }

  @Get('friends')
  @ApiOperation({ summary: 'Get my friends list' })
  getFriends(@SchoolId() schoolId: string, @CurrentUser('userId') userId: string) {
    return this.socialService.getFriends(schoolId, userId)
  }

  @Get('friends/requests')
  @ApiOperation({ summary: 'Get pending friend requests' })
  getPendingRequests(@SchoolId() schoolId: string, @CurrentUser('userId') userId: string) {
    return this.socialService.getPendingRequests(schoolId, userId)
  }

  @Get('friends/suggestions')
  @ApiOperation({ summary: 'Get friend suggestions' })
  getFriendSuggestions(@SchoolId() schoolId: string, @CurrentUser('userId') userId: string) {
    return this.socialService.getFriendSuggestions(schoolId, userId)
  }

  @Post('users/:id/block')
  @ApiOperation({ summary: 'Block a user' })
  blockUser(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') targetId: string,
    @Body() body: { reason?: string },
  ) {
    return this.socialService.blockUser(schoolId, userId, targetId, body.reason)
  }

  // ─── Groups ───────────────────────────────────────────────────────────────

  @Post('groups')
  @ApiOperation({ summary: 'Create a group' })
  createGroup(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: any,
  ) {
    return this.socialService.createGroup(schoolId, userId, dto)
  }

  @Get('groups')
  @ApiOperation({ summary: 'Get all public groups' })
  getGroups(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Query('type') type?: string,
    @Query('search') search?: string,
    @Query('page') page?: number,
  ) {
    return this.socialService.getGroups(schoolId, userId, { type, search, page })
  }

  @Get('groups/mine')
  @ApiOperation({ summary: 'Get my groups' })
  getMyGroups(@SchoolId() schoolId: string, @CurrentUser('userId') userId: string) {
    return this.socialService.getMyGroups(schoolId, userId)
  }

  @Post('groups/:id/join')
  @ApiOperation({ summary: 'Join a group' })
  joinGroup(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.socialService.joinGroup(schoolId, id, userId)
  }

  @Post('groups/:id/leave')
  @ApiOperation({ summary: 'Leave a group' })
  leaveGroup(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.socialService.leaveGroup(schoolId, id, userId)
  }

  // ─── Direct Messages ──────────────────────────────────────────────────────

  @Get('messages/inbox')
  @ApiOperation({ summary: 'Get inbox (latest message per conversation)' })
  getInbox(@SchoolId() schoolId: string, @CurrentUser('userId') userId: string) {
    return this.socialService.getInbox(schoolId, userId)
  }

  @Get('messages/unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  getUnreadCount(@SchoolId() schoolId: string, @CurrentUser('userId') userId: string) {
    return this.socialService.getUnreadCount(schoolId, userId)
  }

  @Get('messages/:userId')
  @ApiOperation({ summary: 'Get conversation with a user' })
  getConversation(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('userId') otherUserId: string,
    @Query('page') page?: number,
  ) {
    return this.socialService.getConversation(schoolId, userId, otherUserId, page)
  }

  @Post('messages/:recipientId')
  @ApiOperation({ summary: 'Send a direct message' })
  sendMessage(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('recipientId') recipientId: string,
    @Body() body: { content: string; attachments?: any[] },
  ) {
    return this.socialService.sendDirectMessage(schoolId, userId, recipientId, body.content, body.attachments)
  }

  // ─── Following ────────────────────────────────────────────────────────────

  @Post('follow/:userId')
  @ApiOperation({ summary: 'Follow a user' })
  follow(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('userId') targetId: string,
  ) {
    return this.socialService.follow(schoolId, userId, targetId)
  }

  @Delete('follow/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Unfollow a user' })
  unfollow(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') userId: string,
    @Param('userId') targetId: string,
  ) {
    return this.socialService.unfollow(schoolId, userId, targetId)
  }

  @Get('users/:userId/profile')
  @ApiOperation({ summary: 'Get user social profile stats' })
  getUserProfile(
    @SchoolId() schoolId: string,
    @CurrentUser('userId') viewerId: string,
    @Param('userId') userId: string,
  ) {
    return this.socialService.getUserProfile(schoolId, userId, viewerId)
  }

  // ─── Analytics ────────────────────────────────────────────────────────────

  @Get('stats')
  @Roles(UserRole.SCHOOL_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get social analytics' })
  getStats(@SchoolId() schoolId: string) {
    return this.socialService.getSocialStats(schoolId)
  }
}
