import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,
  ) {}

  create(conversation: Partial<Conversation>) {
    return this.conversationRepository.save(conversation);
  }

  findAll() {
    return this.conversationRepository.find();
  }

  findOne(id: number) {
    return this.conversationRepository.findOne({ where: { conversation_id: id } });
  }

  async update(id: number, updateData: Partial<Conversation>) {
    await this.conversationRepository.update(id, updateData);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.conversationRepository.delete(id);
  }
}
