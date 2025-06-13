import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import {
  MessageContentMissingException,
  MessageSenderMissingException,
  MessageConversationMissingException,
  MessageNotFoundException,
} from '../exceptions/message.exception';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(message: Partial<Message>) {
    if (!message.content) {
      throw new MessageContentMissingException();
    }
    if (!message.sender_id) {
      throw new MessageSenderMissingException();
    }
    if (!message.conversation_id) {
      throw new MessageConversationMissingException();
    }

    return await this.messageRepository.save(message);
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
    const existing = await this.messageRepository.findOne({ where: { message_id: id } });
    if (!existing) {
      throw new MessageNotFoundException(id);
    }

    await this.messageRepository.update(id, data);
    return this.messageRepository.findOne({ where: { message_id: id } });
  }

  async remove(id: number) {
    const existing = await this.messageRepository.findOne({ where: { message_id: id } });
    if (!existing) {
      throw new MessageNotFoundException(id);
    }

    return this.messageRepository.delete(id);
  }
}
