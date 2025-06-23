import {
  Entity,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { User } from '../user/user.entity';

@Entity('message_reads')
export class MessageRead {
  @PrimaryColumn()
  message_id: number;

  @PrimaryColumn()
  user_id: number;

  @CreateDateColumn()
  read_at: Date;

  @ManyToOne(() => Message, message => message.reads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => User, user => user.message_reads, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
