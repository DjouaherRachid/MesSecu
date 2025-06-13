import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationParticipant } from './conversation-participant.entity';
import { UserOrConversationIdMissingException } from '../exceptions/conversation.exception';

@Injectable()
export class ConversationParticipantService {
  constructor(
    @InjectRepository(ConversationParticipant)
    private cpRepository: Repository<ConversationParticipant>,
  ) {}

  async create(data: Partial<ConversationParticipant>) {
    if (!data.user_id || !data.conversation_id) {
      throw new UserOrConversationIdMissingException();
    }
    return this.cpRepository.save(data);
  }

  findAll() {
    return this.cpRepository.find({ relations: ['user', 'conversation'] });
  }

  findByConversation(conversationId: number) {
    return this.cpRepository.find({
      where: { conversation_id: conversationId },
      relations: ['user'],
    });
  }

  remove(conversationId: number, userId: number) {
    return this.cpRepository.delete({ conversation_id: conversationId, user_id: userId });
  }
}