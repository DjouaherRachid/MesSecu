import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from '../message/message.entity';
import { ConversationParticipant } from '../conversation/conversation-participant.entity';
import { MessageRead } from '../message/message-read.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ unique: true, nullable: false })
  username: string;

  @Column({ unique: true, nullable: false })
  email: string;

  @Column()
  password_hash: string;

  @Column('text')
  public_key: string;

  @Column('text')
  private_key_encrypted: string;

  @Column('text')
  avatar_url: string | null;

  @Column({ default: false })
  is_admin: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login: Date;

  @OneToMany(() => Message, message => message.sender)
  messages: Message[];

  @OneToMany(() => ConversationParticipant, cp => cp.user)
  conversations: ConversationParticipant[];

  @OneToMany(() => MessageRead, messageRead => messageRead.user)
  message_reads: MessageRead[];
}
