import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
  UpdateDateColumn, OneToMany, ManyToMany, JoinTable, 
  ManyToOne
} from 'typeorm';
import { User } from './user.entity';



@Entity('chats')
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  message: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  sender: User;

  @ManyToOne(() => User)
  receiver: User;
}