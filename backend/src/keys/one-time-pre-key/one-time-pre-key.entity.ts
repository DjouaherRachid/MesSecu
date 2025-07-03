import { User } from "src/user/user.entity";
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from "typeorm";

@Entity('one_time_pre_keys')
export class OneTimePreKey {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.one_time_pre_keys, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  key_id: number;

  @Column('text')
  public_key: string;

  @Column({ default: false })
  used: boolean;

  @CreateDateColumn()
  created_at: Date;
}
