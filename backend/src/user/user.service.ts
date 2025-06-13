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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(user: Partial<User>) {
    console.log('[UserService] Tentative de création de l’utilisateur :', user);

    if (!user.username) throw new UsernameMissingException();
    if (!user.email) throw new EmailMissingException();

    try {
      const savedUser = await this.userRepository.save(user);
      console.log('[UserService] Utilisateur enregistré avec succès :', savedUser);
      return savedUser;
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.detail?.includes('username')) throw new UsernameAlreadyExistsException();
        if (error.detail?.includes('email')) throw new EmailAlreadyExistsException();
      }

      console.error('[UserService] Erreur inconnue :', error);
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
}
