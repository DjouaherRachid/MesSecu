import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  create(message: Partial<Message>) {
    return this.messageRepository.save(message);
  }

  findAll() {
    return this.messageRepository.find({ relations: ['sender', 'conversation'] });
  }

  findByConversation(conversationId: number) {
    return this.messageRepository.find({
      where: { conversation_id: conversationId },
      order: { created_at: 'ASC' },
    });
  }

  async update(id: number, data: Partial<Message>) {
    await this.messageRepository.update(id, data);
    return this.messageRepository.findOne({ where: { message_id: id } });
  }

  remove(id: number) {
    return this.messageRepository.delete(id);
  }
}
