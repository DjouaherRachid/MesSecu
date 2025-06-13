import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { ConversationNotFoundException } from '../exceptions/conversation.exception';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

async create(conversation: Partial<Conversation>) {
  try {
    const savedConversation = await this.conversationRepository.save(conversation);
    return savedConversation;
  } catch (error) {
    console.error('[ConversationService] Erreur lors de la création :', error);
    throw new InternalServerErrorException('Erreur lors de la création de la conversation.');
  }
}

  findAll() {
    return this.conversationRepository.find();
  }

  async findOne(id: number) {
    const conv = await this.conversationRepository.findOne({ where: { conversation_id: id } });
    if (!conv) {
      throw new ConversationNotFoundException(id);
    }
    return conv;
  }

  async update(id: number, updateData: Partial<Conversation>) {
    await this.conversationRepository.update(id, updateData);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.conversationRepository.delete(id);
  }
}