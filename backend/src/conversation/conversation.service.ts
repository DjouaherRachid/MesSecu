import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { ConversationNotFoundException } from '../exceptions/conversation.exception';
import { ConversationParticipant } from './conversation-participant.entity';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(ConversationParticipant)
    private cpRepository: Repository<ConversationParticipant>, 
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

  async findByUser(userId: number) {
    const participations = await this.cpRepository.find({
      where: { user_id: userId },
      relations: [
        'conversation',
        'conversation.messages',
        'conversation.messages.messageReads',
        'conversation.participants',
        'conversation.participants.user',
      ],
    });

    return participations.map((part) => {
      const conv = part.conversation;

      // Trier les messages par date décroissante
      const lastMessage = [...(conv.messages || [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      // Identifier si le dernier message a été lu par l'utilisateur
      const isSeen = !!lastMessage?.reads?.some(mr => mr.user.user_id === userId);

      // Trouver l'autre participant
      const otherUser = conv.participants.find(p => p.user_id !== userId)?.user;

      return {
        id: conv.conversation_id,
        updatedAt: conv.created_at,
        otherUser: {
          username: otherUser?.username,
          avatarUrl: otherUser?.avatar_url,
        },
        lastMessage: {
          content: lastMessage?.content || '',
          seen: isSeen,
          createdAt: lastMessage?.created_at || null,
        },
      };
    });
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