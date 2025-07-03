import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register_user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { encryptPrivateKey, decryptPrivateKey, generateRsaKeyPair } from 'src/common/crypto/crypto.utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    const emailExists = await this.userService.findByEmail(dto.email);
    if (emailExists) throw new ConflictException('Email déjà utilisé');

    // Vérification des champs Signal obligatoires
    if (
      !dto.identity_public_key ||
      !dto.signed_pre_key ||
      !dto.signed_pre_key_signature
    ) {
      throw new ConflictException('Clés Signal manquantes.');
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Créer l'utilisateur
    const newUser = await this.userService.create({
      email: dto.email,
      username: dto.username,
      password_hash: hashedPassword,
    });

    return { message: 'Inscription réussie', userId: newUser.user_id };
  }

  async login(dto: LoginUserDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user){
        console.error('Utilisateur non trouvé pour l\'email:', dto.email);
        throw new UnauthorizedException('Utilisateur non trouvé pour l\'email:', dto.email);
    } 
    const passwordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!passwordValid){
        console.error('Mot de passe invalide pour l\'utilisateur:', user.user_id);
        throw new UnauthorizedException('Mot de passe invalide pour l\'utilisateur');
    } 

    const payload = { sub: user.user_id, email: user.email, username: user.username };
    const token = this.jwtService.sign(payload);

    return {
      accessToken: token,
      user: { id: user.user_id, email: user.email, username: user.username },
    };
  }
}
