import { User } from 'src/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('identity_keys')
export class IdentityKey {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => User, user => user.identity_key, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column('text')
  public_key: string;

  @CreateDateColumn()
  created_at: Date;
}
