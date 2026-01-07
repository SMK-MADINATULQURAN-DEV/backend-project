
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Chat } from 'src/entity/chat.entity';
import { Follow } from 'src/entity/follow.entity';
import { Media } from 'src/entity/media.entity';

import { Post } from 'src/entity/post.entity';
import { User } from 'src/entity/user.entity';
import { Like } from 'src/entity/like.entity';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), 
  username: process.env.DB_USERNAME, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_DATABASE,
  entities: [User, Post, Media, Like, Follow, Chat],
  synchronize: true,
  // logging: true,
};