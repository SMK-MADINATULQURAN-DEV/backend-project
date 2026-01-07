import { Entity, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, Column, Unique } from 'typeorm';
import { User } from './user.entity';

@Entity('follows')
@Unique(['follower', 'following']) // Mencegah user follow orang yang sama dua kali
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Siapa yang menekan tombol follow
  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  follower: User;

  // Siapa yang mendapatkan follower baru
  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  following: User;

  @Column({ default: false })
  isAccepted: boolean; // Bisa untuk fitur "Private Account" (Request Follow)

  @CreateDateColumn()
  createdAt: Date;
}