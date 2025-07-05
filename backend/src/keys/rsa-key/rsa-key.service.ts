import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RsaKeyService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async updateRsaPublicKey(userId: number, rsaKey: string) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');
    user.rsa_public_key = rsaKey;
    await this.userRepository.save(user);
    return { message: 'RSA public key updated' };
  }

  async getRsaPublicKey(userId: number) {
    const user = await this.userRepository.findOne({ where: { user_id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return { rsa_public_key: user.rsa_public_key };
  }
}
