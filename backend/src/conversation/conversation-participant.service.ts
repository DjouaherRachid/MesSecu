import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConversationParticipant } from './conversation-participant.entity';

@Injectable()
export class ConversationParticipantService {
  constructor(
    @InjectRepository(ConversationParticipant)
    private cpRepository: Repository<ConversationParticipant>,
  ) {}

  create(data: Partial<ConversationParticipant>) {
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
