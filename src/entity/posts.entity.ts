import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';
import { Media } from './medias.entity';
import { Likes } from './likes.entity';
import { Comments } from './comments.entity';

@Entity('posts')
export class Posts {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @OneToMany(() => Media, (media) => media.posts, { cascade: true }) // <--- Tambahkan cascade di sini
  medias: Media[];

  @OneToMany(() => Likes, (like) => like.posts, { cascade: true })
  likes: Likes[];

  @OneToMany(() => Comments, (c) => c.posts)
  comments: Comments[];
}
