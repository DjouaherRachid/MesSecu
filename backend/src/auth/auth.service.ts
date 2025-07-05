import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register_user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { encryptPrivateKey, decryptPrivateKey, generateRsaKeyPair } from 'src/common/crypto/crypto.utils';
import { Response } from 'express'; 


@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto) {
    const emailExists = await this.userService.findByEmail(dto.email);
    if (emailExists) throw new ConflictException('Email déjà utilisé');

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Créer l'utilisateur
    const newUser = await this.userService.create({
      email: dto.email,
      username: dto.username,
      password_hash: hashedPassword,
      rsa_public_key: dto.rsa_public_key,
    });

    return { message: 'Inscription réussie', userId: newUser.user_id };
  }

  async login(dto: LoginUserDto, res : Response) {
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

    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: true,         
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return res.json({
      accessToken,
      user: { id: user.user_id, email: user.email, username: user.username },
    });
  }

    async refreshToken(refreshToken: string, res: Response) {
    try {
      // Vérifier le refresh token avec le secret refresh
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });

      console

      // Crée un nouveau payload pour l'accessToken
      const newPayload = {
        sub: payload.sub,
        email: payload.email,
        username: payload.username,
      };

      // Génère un nouvel accessToken 
      const newAccessToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
      });

      // Génère un nouveau refreshToken aussi
      const newRefreshToken = this.jwtService.sign(newPayload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
      });

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,         
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      });

      // Retourne les tokens
      return {
        accessToken: newAccessToken,
      };
    } catch (err) {
      // Token invalide ou expiré
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }
  }

}
