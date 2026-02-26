import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Posts } from './posts.entity';
import { Likes } from './likes.entity';
import { Comments } from './comments.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') // Menggunakan UUID v4
  id: string;

  @Column( )
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false, nullable:true })
  password: string;

  //---avatar---!!
 @Column({ nullable: true,})
  avatar: string;
  // --- Fitur Verifikasi Email ---
  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ nullable: true, select: false })
  emailVerificationToken: string;

  @Column({ nullable: true, type: "text" })
  bio: string;
 
  @Column({ nullable: true })
  sampul: string;
 
  @Column({ nullable: true })
  location: string;

  // --- Fitur Lupa Password ---
  @Column({ nullable: true,})
  resetPasswordToken: string;

  @Column({ nullable: true, type: 'timestamp', select: false })
  resetPasswordExpires: Date;

   @OneToMany(() => Posts, (post) => post.user)
  posts: Posts[];
 
  @OneToMany(() => Likes, (like) => like.user)
  likes: Likes[];


  @OneToMany(() => Comments, (c) => c.user)
  comments: Comments[];
 

  // --- Fitur JWT Refresh Token ---
  @Column({ nullable: true, select: false })
  refreshToken: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
