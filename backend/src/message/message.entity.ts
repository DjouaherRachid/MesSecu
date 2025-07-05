import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Conversation } from '../conversation/conversation.entity';
import { MessageRead } from './message-read.entity';  
import { User } from '../user/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  message_id: number;

  @Column()
  conversation_id: number;

  @Column()
  sender_id: number;

  @Column('text')
  content: string;

  @Column({ default: true })
  encrypted: boolean;

  @Column({ default: 3 })
  signal_type: number; // 1 for SignalMessage, 3 for PreKeySignalMessage

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  received_at: Date;

  @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, user => user.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @OneToMany(() => MessageRead, messageRead => messageRead.message)
  reads: MessageRead[];
}
