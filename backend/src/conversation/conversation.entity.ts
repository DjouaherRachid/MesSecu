import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ConversationParticipant } from './conversation-participant.entity';
import { Message } from '../message/message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  conversation_id: number;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ConversationParticipant, cp => cp.conversation)
  participants: ConversationParticipant[];

  @OneToMany(() => Message, message => message.conversation)
  messages: Message[];
}
