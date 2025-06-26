// auth/guards/ws-jwt.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { AuthGuard } from '@nestjs/passport';
import { WsException } from '@nestjs/websockets/errors/ws-exception';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const headers = client.handshake.headers;

    const tokenWithBearer = headers['authorization'] || headers['auth']; 
    if (!tokenWithBearer) {
      throw new WsException('Token manquant dans les headers');
    }

    const token = tokenWithBearer.replace('Bearer ', '');

    try {
      const payload = this.jwtService.verify(token);
      // Optionnel : attacher l'utilisateur au socket
      client.user = payload;
      console.log('[WsJwtGuard] Utilisateur authentifié :', payload);
      return true;
    } catch (err) {
      throw new WsException('Token invalide');
    }
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}