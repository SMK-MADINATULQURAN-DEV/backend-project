import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
}
