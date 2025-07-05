import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Session } from './session.entity';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { IdentityKeysService } from '../keys/identity-key/identity-key.service';
import { SignedPreKeysService } from '../keys/signed-pre-key/signed-pre-key.service';
import { OneTimePreKeyService } from '../keys/one-time-pre-key/one-time-pre-key.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session) private sessionRepo: Repository<Session>,
    @InjectRepository(User) private userRepo: Repository<User>,
    private readonly identityKeysService: IdentityKeysService,
    private readonly signedPreKeysService: SignedPreKeysService,
    private readonly oneTimePreKeyService: OneTimePreKeyService,
  ) {}

  async upsertSession(userId: number, peerId: number, sessionData: any): Promise<Session> {
    const user = await this.userRepo.findOneByOrFail({ user_id: userId });
    const peer = await this.userRepo.findOneByOrFail({ user_id: peerId });

    let session = await this.sessionRepo.findOne({
      where: { user: { user_id: userId }, peer: { user_id: peerId } },
      relations: ['user', 'peer'],
    });

    if (session) {
      session.session_data = sessionData;
    } else {
      session = this.sessionRepo.create({
        user,
        peer,
        session_data: sessionData,
      });
    }

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

  /**
   * Retourne les clés publiques (identityKey, signedPreKey, oneTimePreKey)
   * d'un utilisateur cible pour initialiser une session X3DH
   */
  async getPublicKeysForUser(userId: number) {
    // Identité
    const identityKey = await this.identityKeysService.findByUserId(userId);
    if (!identityKey) throw new NotFoundException('Identity key not found for user');

    // Signed PreKey (actif)
    const signedPreKey = await this.signedPreKeysService.findActiveByUserId(userId);
    if (!signedPreKey) throw new NotFoundException('Signed pre-key not found or inactive for user');

    // One-Time PreKey (le premier non utilisé, idéalement)
    const oneTimePreKeys = await this.oneTimePreKeyService.findAllForUser(userId);
    const availableOneTimePreKey = oneTimePreKeys.find(k => !k.used);
    if (!availableOneTimePreKey) throw new NotFoundException('No available one-time pre-keys for user');

    return {
      identityKey: identityKey.public_key,
      signedPreKey: {
        key_id: signedPreKey.key_id,
        public_key: signedPreKey.public_key,
        signature: signedPreKey.signature,
      },
      oneTimePreKey: {
        key_id: availableOneTimePreKey.key_id,
        public_key: availableOneTimePreKey.public_key,
      },
    };
  }
}
