import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
  UpdateDateColumn, OneToMany, ManyToMany, JoinTable, 
  ManyToOne
} from 'typeorm';
import { Post } from './post.entity';

@Entity('medias')
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  url: string;

  @Column()
  type: 'image' | 'video'; // Membedakan jenis file

  @ManyToOne(() => Post, (post) => post.medias)
  post: Post;
}