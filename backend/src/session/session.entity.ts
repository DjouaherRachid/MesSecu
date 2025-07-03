import { User } from "src/user/user.entity";
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, CreateDateColumn } from "typeorm";

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.sessions_initiated, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, user => user.sessions_received, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'peer_id' })
  peer: User;

  @Column({ type: 'jsonb' })
  session_data: any;

  @CreateDateColumn()
  created_at: Date;
}
