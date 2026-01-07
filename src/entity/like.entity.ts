import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

@Entity('likes')
export class Like {
@PrimaryGeneratedColumn('uuid')
  id: string;
  
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.likes, { onDelete: 'CASCADE' })
  user: User

  // Relasi ke Post
  @ManyToOne(() => Post, (post) => post.likes, { onDelete: 'CASCADE' })
  post: Post;

  //   @ManyToOne(() => Post, (post) => post.likes)
  //   post: Post;
}
