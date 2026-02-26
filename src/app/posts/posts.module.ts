import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostController } from './posts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entity/user.entity';
import { Posts } from 'src/entity/posts.entity';
import { Media } from 'src/entity/medias.entity';
import { Likes } from 'src/entity/likes.entity';
import { Comments } from 'src/entity/comments.entity';

@Module({
  imports : [TypeOrmModule.forFeature([User, Posts, Media, Likes, Comments])],
  providers: [PostsService],
  controllers: [PostController]
})
export class PostsModule {}
