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

    console.log(`[Gateway] Message reçu de ${sender.username} pour conversation ${data.conversationId}`);

    // 1. Sauvegarde du message via MessageService
    const newMessage = await this.messageService.create({
      conversation_id: data.conversationId,
      content: data.content,
      sender_id: sender.id,
    });

    // 2. Émettre aux clients de la room
    this.server.to(`conversation_${data.conversationId}`).emit('new_message', newMessage);

    return { success: true };
  }
}
