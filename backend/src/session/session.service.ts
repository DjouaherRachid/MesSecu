import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(User) private userRepo: Repository<User>,
  ) {}

  async createSession(userId: number, peerId: number, sessionData: any): Promise<Session> {
    const user = await this.userRepo.findOneByOrFail({ user_id: userId });
    const peer = await this.userRepo.findOneByOrFail({ user_id: peerId });

    const session = this.sessionRepo.create({
      user,
      peer,
      session_data: sessionData,
    });

    return this.sessionRepo.save(session);
  }

  async findByUserAndPeer(userId: number, peerId: number): Promise<Session | null> {
    return this.sessionRepo.findOne({
      where: { user: { user_id: userId }, peer: { user_id: peerId } },
      relations: ['user', 'peer'],
    });
  }

  async findAll(): Promise<Session[]> {
    return this.sessionRepo.find({ relations: ['user', 'peer'] });
  }

  async deleteByUserAndPeer(userId: number, peerId: number): Promise<void> {
    const session = await this.findByUserAndPeer(userId, peerId);
    if (!session) throw new NotFoundException('Session not found');
    await this.sessionRepo.remove(session);
  }
}
