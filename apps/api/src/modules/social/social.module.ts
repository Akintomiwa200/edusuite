import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SocialService } from './social.service'
import { SocialController } from './social.controller'
import {
  Post, PostSchema,
  Friendship, FriendshipSchema,
  Group, GroupSchema,
  DirectMessage, DirectMessageSchema,
  Follow, FollowSchema,
} from './schemas/social.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Friendship.name, schema: FriendshipSchema },
      { name: Group.name, schema: GroupSchema },
      { name: DirectMessage.name, schema: DirectMessageSchema },
      { name: Follow.name, schema: FollowSchema },
    ]),
  ],
  controllers: [SocialController],
  providers: [SocialService],
  exports: [SocialService],
})
export class SocialModule {}
