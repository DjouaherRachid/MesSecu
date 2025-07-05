import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { MessageRead } from './message-read.entity';
import {
  MessageContentMissingException,
  MessageSenderMissingException,
  MessageConversationMissingException,
  MessageNotFoundException,
} from '../exceptions/message.exception';
import { Conversation } from 'src/conversation/conversation.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    @InjectRepository(MessageRead)
    private messageReadRepository: Repository<MessageRead>,

    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(message: Partial<Message>) {
    console.log('Creating message:', message);
    if (!message.content) {
      throw new MessageContentMissingException();
    }
    if (!message.sender_id) {
      throw new MessageSenderMissingException();
    }
    if (!message.conversation_id) {
      throw new MessageConversationMissingException();
    }

    console.log('Message content length:', message.content.length);
    console.log("content",message.content);

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

  async findById(messageId: number) {
  const message = await this.messageRepository.findOne({
    where: { message_id: messageId },
    relations: ['sender', 'reads', 'conversation'], // ajoute les relations nécessaires ici
  });
    
  if (!message) {
    throw new MessageNotFoundException(messageId);
  }

  return message ;
  }


  async getMessagesPaginated(userId: number, conversationId: number, before?: string, limit = 20 ) {

  // Récupérer tous les participants avec leurs users
  const participants = await this.conversationRepository
    .createQueryBuilder('c')
    .innerJoinAndSelect('c.participants', 'p')
    .innerJoinAndSelect('p.user', 'u') // Assure-toi que la relation est bien configurée
    .where('c.conversation_id = :conversationId', { conversationId })
    .getOne();

  if (!participants) {
    throw new NotFoundException('Conversation introuvable');
  }

  // participants.participants est un tableau des participants
  const participantUsers = participants.participants;

  // Vérifier si userId est dans les participants
  const isParticipant = participantUsers.some(p => p.user.user_id === userId);

  if (!isParticipant) {
    throw new UnauthorizedException('Vous ne participez pas à cette conversation');
  }

  const userMap = new Map<number, string>();
  participantUsers.forEach(p => {
    userMap.set(p.user.user_id, p.user.username);
  });

  const query = this.messageRepository
    .createQueryBuilder('message')
    .leftJoinAndSelect('message.sender', 'sender')
    .leftJoinAndSelect('message.reads', 'reads')
    .where('message.conversation_id = :conversationId', { conversationId })
    .orderBy('message.created_at', 'DESC')
    .take(limit);
  
  if (before) {
    query.andWhere('message.created_at < :before', { before });
  }

  const messages = await query.getMany();
  return messages.reverse().map((message) => ({
    message_id: message.message_id,
    content: message.content,
    sender: {
      user_id: message.sender.user_id,
      name: message.sender.username,
      avatar: message.sender.avatar_url || null, 
    },
    created_at: message.created_at,
    reads: (message.reads || []).map(read => ({
      user_id: read.user_id,
      username: userMap.get(read.user_id) || 'Inconnu',
      read_at: read.read_at,
    })),
  }));

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


    async markAsRead(messageId: number, userId: number) {
    // Vérifier que le message existe
    const message = await this.messageRepository.findOne({ where: { message_id: messageId } });
    if (!message) {
      throw new NotFoundException(`Message ${messageId} non trouvé`);
    }

    // Vérifier si lecture déjà enregistrée
    const existingRead = await this.messageReadRepository.findOne({
      where: { message_id: messageId, user_id: userId },
    });

    if (existingRead) {
      return existingRead; 
    }

    const readEntry = this.messageReadRepository.create({
      message_id: messageId,
      user_id: userId,
    });

    return this.messageReadRepository.save(readEntry);
  }
}
