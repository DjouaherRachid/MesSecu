import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { UseGuards, Inject } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { MessageService } from '../message/message.service'; 
import { ConversationService } from '../conversation/conversation.service'; 
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    private readonly conversationService: ConversationService,
    private readonly jwtService: JwtService,
  ) {}

  afterInit() {
    console.log('[Gateway] Initialisé');
  }

  async handleConnection(client: Socket) {
    try {
      const tokenWithBearer = client.handshake.headers['authorization'] || client.handshake.headers['auth'];
      if (!tokenWithBearer) {
        console.warn('[Gateway] Connexion refusée : token manquant');
        client.disconnect(true);
        return;
      }
      const tokenStr = Array.isArray(tokenWithBearer) ? tokenWithBearer[0] : tokenWithBearer;
      const token = tokenStr.replace('Bearer ', '');
      const payload = this.jwtService.verify(token);
      client.data.user = payload;
      console.log('[Gateway] Client connecté avec utilisateur:', payload);
      this.server.emit('user_connected', payload);

    } catch (err) {
      console.warn('[Gateway] Connexion refusée : token invalide');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('[Gateway] Client déconnecté :', client.id);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`conversation_${data.conversationId}`);
    console.log(`[Gateway] Client ${client.id} a rejoint la conversation ${data.conversationId}`);
    return { joined: data.conversationId };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody()
    data: {
      conversationId: number;
      content: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const sender = client.data.user;
    const cleanData = JSON.parse(JSON.stringify(data)); 
    console.log("[Gateway] sender :", sender);
    console.log("[Gateway] data :", data, data.conversationId, data.content);

    if (!sender) {
      console.warn('[Gateway] Utilisateur non authentifié pour envoyer un message');
      client.emit('error', { message: 'Non authentifié.' });
      return;
    }

    console.log(`[Gateway] Requête de message pour conversation ${data.conversationId} de ${client.data.user.email}`);


    try {
      // ✅ Vérification de la participationc
      console.log(`[Gateway] Vérification de la participation de l'utilisateur ${sender.sub} à la conversation ${data.conversationId}`);
      const isParticipant = await this.conversationService.isUserInConversation(  
        data.conversationId,
        sender.sub,
      );

      if (!isParticipant) {
        console.warn(`[Gateway] Utilisateur ${sender.id} n'est pas participant à la conversation ${data.conversationId}`);
        client.emit('error', {
          message: 'Vous ne faites pas partie de cette conversation.',
        });
        return;
      }

      console.log(`[Gateway] Message reçu de ${sender.sub} pour conversation ${data.conversationId}`);

      // ✅ 1. Sauvegarde du message
      const newMessage = await this.messageService.create({
        conversation_id: data.conversationId,
        content: data.content,
        sender_id: sender.sub,
      });

      // ✅ 2. Diffusion à la room
      const room = `conversation_${data.conversationId}`;
      this.server.to(room).emit('new_message', {
        conversationId : data.conversationId,
        message: newMessage,
      });

      // ✅ 3. Réponse au client
      return { status: 'ok', message: newMessage };
    } catch (err) {
      console.error('[Gateway] Erreur lors de l\'envoi du message :', err);
      client.emit('error', { message: 'Erreur lors de l\'envoi du message.' });
    }
  }

}
