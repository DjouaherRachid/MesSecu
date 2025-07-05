import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/user/user.entity';
import { ConversationParticipant } from 'src/conversation/conversation-participant.entity';
import { Conversation } from 'src/conversation/conversation.entity';


@Entity('conversation_keys')
export class ConversationKey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('number', { nullable: false })
  conversation_id: number;

  @Column()
  user_id: number;

  @ManyToOne(() => ConversationParticipant, cp => cp.conversation_keys, { onDelete: 'CASCADE' })
  @JoinColumn([
    { name: 'conversation_id', referencedColumnName: 'conversation_id' },
    { name: 'user_id', referencedColumnName: 'user_id' },
  ])
  conversation_participant: ConversationParticipant;

  @ManyToOne(() => User, user => user.conversation_keys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Conversation, conversation => conversation.conversation_id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column('text', { nullable: false })
  encrypted_aes_key: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
