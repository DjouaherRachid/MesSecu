import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Message } from '../message/message.entity';
import { ConversationParticipant } from '../conversation/conversation-participant.entity';
import { MessageRead } from '../message/message-read.entity';
import { OneTimePreKey } from '../keys/one-time-pre-key/one-time-pre-key.entity';
import { Session } from '../session/session.entity';
import { IdentityKey } from '../keys/identity-key/identity-key.entity';
import { SignedPreKey } from '../keys/signed-pre-key/signed-pre-key.entity';
import { ConversationKey } from '../keys/conversation-key/conversation-keys.entity';

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

  @Column('text', { nullable: true })
  avatar_url: string | null;

  @Column('text', { nullable: false })
  rsa_public_key : string ;

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

  @OneToMany(() => OneTimePreKey, key => key.user)
  one_time_pre_keys: OneTimePreKey[];

  @OneToMany(() => Session, session => session.user)
  sessions_initiated: Session[];

  @OneToMany(() => Session, session => session.peer)
  sessions_received: Session[];

  @OneToOne(() => IdentityKey, identityKey => identityKey.user, { cascade: true })
  identity_key: IdentityKey;

  @OneToMany(() => SignedPreKey, signedPreKey => signedPreKey.user, { cascade: true })
  signed_pre_keys: SignedPreKey[];

  @OneToMany(() => ConversationKey, ck => ck.user)
  conversation_keys: ConversationKey[];
}
