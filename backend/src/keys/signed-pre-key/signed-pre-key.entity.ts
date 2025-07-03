import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';

@Entity('signed_pre_keys')
export class SignedPreKey {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.signed_pre_keys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  key_id: number;

  @Column('text')
  public_key: string;

  @Column('text')
  signature: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  created_at: Date;
}
