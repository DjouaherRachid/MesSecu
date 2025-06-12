import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Message } from '../message/message.entity';
import { ConversationParticipant } from '../conversation/conversation-participant.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password_hash: string;

  @Column('text')
  public_key: string;

  @Column('text')
  private_key_encrypted: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Message, message => message.sender)
  messages: Message[];

  @OneToMany(() => ConversationParticipant, cp => cp.user)
  conversations: ConversationParticipant[];
}
