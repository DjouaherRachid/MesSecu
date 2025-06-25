import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findFavoritesByUser(userId: number) {
    const favorites = await this.cpRepository.find({
      where: { user_id: userId, is_favorite: true },
      relations: ['conversation', 'conversation.messages', 'conversation.participants', 'conversation.participants.user'],
    });

    // return favorites.map(p => p.conversation);

    return favorites.map((part) => {
      const conv = part.conversation;

      // Trier les messages par date décroissante
      const lastMessage = [...(conv.messages || [])].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];

      // Identifier si le dernier message a été lu par l'utilisateur
      const isSeen = !!lastMessage?.reads?.some(mr => mr.user_id === userId);

      // Trouver les autres participants
      const otherUsers = conv.participants
        .filter(p => p.user_id !== userId)
        .map(p => p.user);

      return {
        id: conv.conversation_id,
        name: conv.name || '',
        updated_at: conv.updated_at,
        other_users: otherUsers.map(user => ({
          username: user.username,
          avatar_url: user.avatar_url,
        })),
        last_message: {
          content: lastMessage?.content || '',
          sender_id: lastMessage?.sender_id || null,
          seen: isSeen,
          created_at: lastMessage?.created_at || null,
        },
      };
    });
    
  }

  remove(conversationId: number, userId: number) {
    return this.cpRepository.delete({ conversation_id: conversationId, user_id: userId });
  }

  async toggleFavorite(conversationId: number, userId: number, isFavorite: boolean) {
    const participant = await this.cpRepository.findOne({
      where: { conversation_id: conversationId, user_id: userId },
    });

    if (!participant) {
      throw new NotFoundException('Participant non trouvé');
    }

    participant.is_favorite = isFavorite;
    return this.cpRepository.save(participant);
  }

}