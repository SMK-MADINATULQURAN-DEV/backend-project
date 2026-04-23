import { Module } from '@nestjs/common';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { User } from 'src/entity/user.entity';
import { Posts } from 'src/entity/posts.entity';
import { Media } from 'src/entity/medias.entity';
import { Likes } from 'src/entity/likes.entity';
import { Comments } from 'src/entity/comments.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
   imports : [TypeOrmModule.forFeature([User, Posts, Media, Likes, Comments])],
  controllers: [CommentController],
  providers: [CommentService]
})
export class CommentModule {}
