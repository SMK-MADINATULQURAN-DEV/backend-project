import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Post } from './post.entity';
import { Follow } from './follow.entity';
import { Like } from './like.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') // Menggunakan UUID v4
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  // --- Fitur Verifikasi Email ---
  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, select: false })
  emailVerificationToken: string;

  // --- Fitur Lupa Password ---
  @Column({ nullable: true, select: false })
  resetPasswordToken: string;

  @Column({ nullable: true, type: 'timestamp', select: false })
  resetPasswordExpires: Date;

  // --- Fitur JWT Refresh Token ---
  @Column({ nullable: true, select: false })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Like, (like) => like.user)
  likes: Like[];

  @OneToMany(() => Follow, (follow) => follow.following)
  followers: Follow[];

  // // Orang-orang yang saya ikuti
  @OneToMany(() => Follow, (follow) => follow.follower)
  following: Follow[];
}
