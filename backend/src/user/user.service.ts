import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import {
  UsernameMissingException,
  EmailMissingException,
  UsernameAlreadyExistsException,
  EmailAlreadyExistsException,
  UserNotFoundException,
} from '../exceptions/user.exception';
import { ConversationParticipant } from 'src/conversation/conversation-participant.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ConversationParticipant)
    private cpRepository: Repository<ConversationParticipant>,
  ) {}

  async create(user: Partial<User>) {
    if (!user.username) throw new UsernameMissingException();
    if (!user.email) throw new EmailMissingException();

    try {
      const savedUser = await this.userRepository.save(user);
      return savedUser;
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail?.includes('username')) throw new UsernameAlreadyExistsException();
        if (error.detail?.includes('email')) throw new EmailAlreadyExistsException();
      }

      throw new InternalServerErrorException('Erreur inattendue lors de la création.');
    }
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { user_id: id } });
    if (!user) throw new UserNotFoundException(id);
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

async findMyContacts(userId: number): Promise<User[]> {
  try {
    const participations = await this.cpRepository.find({
      where: { user_id: userId },
      relations: [
        'conversation',
        'conversation.participants',
        'conversation.participants.user',
      ],
    });

    const contactMap = new Map<number, User>();

    for (const participation of participations) {
      for (const otherParticipant of participation.conversation.participants) {
        const otherUser = otherParticipant.user;
        if (otherUser.user_id !== userId && !contactMap.has(otherUser.user_id)) {
          contactMap.set(otherUser.user_id, otherUser);
        }
      }
    }

    return Array.from(contactMap.values());
  } catch (error) {
    console.error('[UserService] Erreur lors de la récupération des contacts :', error);
    throw new InternalServerErrorException('Erreur lors de la récupération des contacts.');
  }
}

  async update(id: number, updateData: Partial<User>) {
    const user = await this.findOne(id); // délégué à findOne pour l'exception si non trouvé

    try {
      await this.userRepository.update(id, updateData);
      return this.findOne(id);
    } catch (error) {
      console.error('[UserService] Erreur lors de la mise à jour :', error);
      throw new InternalServerErrorException('Erreur lors de la mise à jour.');
    }
  }

  async remove(id: number) {
    const user = await this.findOne(id); // exception si non trouvé
    try {
      await this.userRepository.delete(id);
      return { message: `Utilisateur ${id} supprimé.` };
    } catch (error) {
      console.error('[UserService] Erreur lors de la suppression :', error);
      throw new InternalServerErrorException('Erreur lors de la suppression.');
    }
  }

  async findByUsername(username: string) {
    return this.userRepository.findOne({ where: { username } });
  }
}
