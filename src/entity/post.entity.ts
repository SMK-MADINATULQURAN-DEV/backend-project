import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
  UpdateDateColumn, OneToMany, ManyToMany, JoinTable, 
  ManyToOne
} from 'typeorm';
import { User } from './user.entity';
import { Media } from './media.entity';
import { Like } from './like.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.posts)
  user: User;

  @OneToMany(() => Media, (media) => media.post)
  medias: Media[];

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];
}

