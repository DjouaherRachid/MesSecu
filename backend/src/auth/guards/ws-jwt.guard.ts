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

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const authHeader = client.handshake.headers.authorization;

    console.log('[Guard] Handshake headers:', client.handshake.headers);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[Guard] Missing or malformed Authorization header');
      throw new UnauthorizedException('Missing Authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    try {
      const payload = this.jwtService.verify(token);
      console.log('[Guard] JWT payload:', payload);
      // Stocker dans handshake si besoin
      client.data.user = payload;
      return true;
    } catch (err) {
      console.error('[Guard] JWT verification failed:', err.message);
      throw new UnauthorizedException('Invalid token');
    }
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}