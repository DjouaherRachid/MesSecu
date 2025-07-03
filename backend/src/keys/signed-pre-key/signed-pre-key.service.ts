import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { SignedPreKey } from './signed-pre-key.entity';

@Injectable()
export class SignedPreKeysService {
  constructor(
    @InjectRepository(SignedPreKey)
    private repo: Repository<SignedPreKey>
  ) {}

  async create(user: User, data: Partial<SignedPreKey>) {
    const key = this.repo.create({ ...data, user });
    return this.repo.save(key);
  }

  async findActiveByUserId(user_id: number) {
    const keys = await this.repo.find({
      where: { user: { user_id }, active: true },
      order: { created_at: 'DESC' }
    });
    return keys;
  }
}
