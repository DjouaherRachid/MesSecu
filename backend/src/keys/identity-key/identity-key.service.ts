import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { IdentityKey } from './identity-key.entity';

@Injectable()
export class IdentityKeysService {
  constructor(
    @InjectRepository(IdentityKey)
    private repo: Repository<IdentityKey>
  ) {}

  async create(user: User, public_key: string) {
    const identityKey = this.repo.create({ user, public_key });
    return this.repo.save(identityKey);
  }

  async findByUserId(user_id: number) {
    const key = await this.repo.findOne({ where: { user: { user_id } } });
    if (!key) throw new NotFoundException('Identity key not found');
    return key;
  }
}
