
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Comments } from 'src/entity/comments.entity';
import { Likes } from 'src/entity/likes.entity';
import { Media } from 'src/entity/medias.entity';
import { Posts } from 'src/entity/posts.entity';
import { User } from 'src/entity/user.entity';
export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT), 
  username: process.env.DB_USERNAME, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_DATABASE,
  entities: [User, Posts, Media, Likes, Comments],
  synchronize: true,
  // logging: true,
};