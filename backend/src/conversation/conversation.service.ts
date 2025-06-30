import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { ConversationNotFoundException } from '../exceptions/conversation.exception';
import { ConversationParticipant, UserRole } from './conversation-participant.entity';
import { User } from 'src/user/user.entity';
import { CreateConversationDto } from 'src/auth/dto/conversation-dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private conversationRepository: Repository<Conversation>,

    @InjectRepository(ConversationParticipant)
    private cpRepository: Repository<ConversationParticipant>, 

    @InjectRepository(User)
    private userRepository: Repository<User>, 

  ) {}

  async create(conversationDto: CreateConversationDto, creatorUserId: number) {
    const { name, picture_url, participants } = conversationDto;

    if (!participants || !Array.isArray(participants) || participants.length === 0) {
      throw new BadRequestException('La liste des participants est obligatoire et ne peut pas être vide.');
    }

    console.log('[ConversationService] userCreatorId:', creatorUserId);
    // Ajouter le créateur dans participants s'il n'y est pas déjà
    const participantsWithCreator = participants.includes(creatorUserId)
      ? participants
      : [...participants, creatorUserId];

    console.log('[ConversationService] Création de la conversation avec les participants:', participantsWithCreator);

    // Création de la conversation
    const savedConversation = await this.conversationRepository.save({
      name,
      picture_url,
    });

    // Préparation des participants avec le rôle
    const participantEntities = participantsWithCreator.map(userId => {
      const role = userId === creatorUserId ? UserRole.ADMIN : UserRole.MEMBER;
      return this.cpRepository.create({
        user: { user_id: userId },
        conversation: { conversation_id: savedConversation.conversation_id },
        role,
      });
    });

    // Sauvegarde des participants
    try {
      await this.cpRepository.save(participantEntities);
    } catch (err) {
      console.error('[create] erreur lors de la sauvegarde des participants:', err);
      throw err;
    }

    return savedConversation;
  }
  
  async findByUser(userId: number) {
    const participations = await this.cpRepository.find({
      where: { user_id: userId },
      relations: [
        'conversation',
        'conversation.messages',
        'conversation.messages.reads',
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
          message_id: lastMessage?.message_id || 0,
          content: lastMessage?.content || '',
          sender_id: lastMessage?.sender_id || null,
          sender_name: conv.participants.find(u => u.user_id === lastMessage?.sender_id)?.user.username || '',
          seen: isSeen,
          created_at: lastMessage?.created_at || null,
        },
      };  
    });
  }

  async getUserConversationIds(userId: number): Promise<number[]> {
  const participations = await this.cpRepository.find({
    where: { user_id: userId },
    relations: ['conversation'],
  });

  return participations.map(p => p.conversation.conversation_id);
  }

  async findAll() {
    return await this.conversationRepository.find();
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

  async isUserInConversation(conversationId: number, userId: number): Promise<boolean> {
  const participant = await this.cpRepository.findOne({
    where: { conversation_id: conversationId, user_id: userId },
  });
  return !!participant;
}

}