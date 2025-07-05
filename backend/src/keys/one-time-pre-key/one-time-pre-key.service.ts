import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OneTimePreKey } from './one-time-pre-key.entity';
import { User } from '../../user/user.entity';

@Injectable()
export class OneTimePreKeyService {
  constructor(
    @InjectRepository(OneTimePreKey)
    private keyRepository: Repository<OneTimePreKey>,
  ) {}

  async generateKey(user: User, keyId: number, publicKey: string) {
    const key = this.keyRepository.create({
      user,
      key_id: keyId,
      public_key: publicKey,
    });
    return this.keyRepository.save(key);
  }

  async findAvailableKey(userId: number): Promise<OneTimePreKey> {
    const key = await this.keyRepository.findOne({
      where: { user: { user_id: userId }, used: false },
      order: { created_at: 'ASC' },
    });

    if (!key) throw new NotFoundException('No available One-Time Pre-Key');
    return key;
  }

  async markAsUsed(id: number) {
    await this.keyRepository.update(id, { used: true });
  }

  async findAllForUser(userId: number) {
    return this.keyRepository.find({ where: { user: { user_id: userId } } });
  }

  async create(user: Partial<User>, keyData: { key_id: number; public_key: string }): Promise<OneTimePreKey> {
    const newKey = this.keyRepository.create({
      user,
      key_id: keyData.key_id,
      public_key: keyData.public_key,
      used: false,
    });
    return this.keyRepository.save(newKey);
  }

  async createMany(userId: number, keysData: { key_id: number; public_key: string }[]): Promise<OneTimePreKey[]> {
    const user = { user_id: userId } as Partial<User>;

    const newKeys = keysData.map(keyData =>
      this.keyRepository.create({
        user,
        key_id: keyData.key_id,
        public_key: keyData.public_key,
        used: false,
      }),
    );

    return this.keyRepository.save(newKeys);
  }

}
