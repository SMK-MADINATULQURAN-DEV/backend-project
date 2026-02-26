import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Posts } from './posts.entity';

@Entity('comments')
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.comments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Posts, (post) => post.comments, { onDelete: 'CASCADE' })
  posts: Posts;
}
