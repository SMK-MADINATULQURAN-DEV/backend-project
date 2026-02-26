import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
  UpdateDateColumn, OneToMany, ManyToMany, JoinTable, 
  ManyToOne
} from 'typeorm';
import { Posts } from './posts.entity';
 
@Entity('medias')
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id: string;
 
  @Column()
  url: string;
 
  @Column()
  type: 'image' | 'video'; // Membedakan jenis file
 
  @ManyToOne(() => Posts, (post) => post.medias,  { onDelete: 'RESTRICT' })
  posts: Posts;
}