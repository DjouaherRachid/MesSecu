import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateConversationKeyDto } from './dto/create-conversation-key.dto';
import { ConversationParticipant } from '../../conversation/conversation-participant.entity';
import { User } from '../../user/user.entity';
import { ConversationKey } from 'src/keys/conversation-key/conversation-keys.entity';
import { Conversation } from 'src/conversation/conversation.entity';

@Injectable()
export class ConversationKeyService {
  constructor(
    @InjectRepository(ConversationKey)
    private readonly repo: Repository<ConversationKey>
  ) {}
    async create(dto: CreateConversationKeyDto) {
      
    const conversationKey = this.repo.create({
      encrypted_aes_key: dto.encrypted_aes_key,
      conversation_id: dto.conversation_id,
      user_id: dto.user_id,
    });

    return this.repo.save(dto);
    }


  async getEncryptedKey(conversationId: number, userId: number) {

    console.log("[getEncryptedKey] Fetching encrypted key for conversationId:", conversationId, "and userId:", userId);
    const key = await this.repo.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId,
      },
    });
    console.log("[getEncryptedKey] Retrieved key:", key);

    if (!key) {
      throw new NotFoundException('Encrypted key not found');
    }

    return { encrypted_aes_key: key.encrypted_aes_key };
  }

  async delete(participantId: number) {
    const result = await this.repo.delete({ conversation_participant: { id: participantId } as unknown as ConversationParticipant });
    return { deleted: result.affected };
  }
}
