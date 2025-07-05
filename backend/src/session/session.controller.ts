import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // Upsert session : créer ou mettre à jour
  @Post()
  async upsertSession(
    @Body() body: { userId: number; peerId: number; sessionData: any }
  ) {
    return this.sessionService.upsertSession(body.userId, body.peerId, body.sessionData);
  }

  // Récupérer session entre 2 users
  @Get(':userId/:peerId')
  async getSession(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('peerId', ParseIntPipe) peerId: number
  ) {
    const session = await this.sessionService.findByUserAndPeer(userId, peerId);
    if (!session) return null;
    return session.session_data;
  }

  // Récupérer les clés publiques d'un utilisateur pour init X3DH
  @Get('keys/:userId')
  async getPublicKeys(@Param('userId', ParseIntPipe) userId: number) {
    return this.sessionService.getPublicKeysForUser(userId);
  }
}
