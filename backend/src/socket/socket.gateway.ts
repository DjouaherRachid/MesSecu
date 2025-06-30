import { UserService } from './../user/user.service';
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
import { UseGuards, Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { MessageService } from '../message/message.service'; 
import { ConversationService } from '../conversation/conversation.service'; 
import { JwtService } from '@nestjs/jwt/dist/jwt.service';
import { read } from 'fs';
@UseGuards(WsJwtGuard)
@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messageService: MessageService,
    @Inject(forwardRef(() => ConversationService))
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

      // Le client rejoint une room spécifique à l'utilisateur
      const userRoom = `user_${payload.sub}`;
      client.join(userRoom);
      console.log(`[Gateway] Client ${client.id} a rejoint la room utilisateur ${userRoom}`);

      this.server.emit('user_connected', payload);

    } catch (err) {
      console.warn('[Gateway] Connexion refusée : token invalide');
      client.disconnect(true);
    }
  }

  handleDisconnect(client: Socket) {
    try {
    console.log('[Gateway] Client déconnecté :', client.id);
    } catch (err) {
      console.error('[Gateway] Erreur lors de la déconnexion du client :', err);
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('join_conversation')
  handleJoinConversation(
    @MessageBody() data: { conversationId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
    client.join(`conversation_${data.conversationId}`);
    console.log(`[Gateway] Client ${client.id} a rejoint la conversation ${data.conversationId}`);
    return { joined: data.conversationId };
    } catch (err) {
      throw new Error(`[Gateway] Erreur lors de la tentative de rejoindre la conversation ${data.conversationId}: ${err.message}`);
    }
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

      // ✅ 1. Sauvegarde du message
      const newMessage = await this.messageService.create({
        conversation_id: data.conversationId,
        content: data.content,
        sender_id: sender.sub,
      });

      // Charger les relations nécessaires (ex: sender, reads) pour la diffusion
      const messageWithRelations = await this.messageService.findById(newMessage.message_id);

      // ✅ 2. Diffusion à la room
      const room = `conversation_${data.conversationId}`;
      this.server.to(room).emit('new_message', {
        conversationId: data.conversationId,
        message: {
          message_id: messageWithRelations.message_id,
          content: messageWithRelations.content,
          sender: {
            user_id: messageWithRelations.sender.user_id,
            name: messageWithRelations.sender.username,
            avatar: messageWithRelations.sender.avatar_url || null,
          },
          created_at: messageWithRelations.created_at,
          reads: (messageWithRelations.reads || []).map(read => ({
            user_id: read.user_id,
            read_at: read.read_at,
          })),
        },
      });

      // ✅ 3. Réponse au client
      return { status: 'ok', message: newMessage };
    } catch (err) {
      console.error('[Gateway] Erreur lors de l\'envoi du message :', err);
      client.emit('error', { message: 'Erreur lors de l\'envoi du message.' });
    }
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message_read')
  async handleMessageRead(
    @MessageBody() data: { messageId: number },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const user = client.data.user;
      const { messageId } = data;

      console.log(`[Gateway] Utilisateur ${user.sub} a lu le message ${messageId}`);

      // Récupérer la conversation via le message
      const message = await this.messageService.findById(messageId);
      if (!message) {
        console.warn(`[Gateway] Message ${messageId} introuvable`);
        return;
      }

      // Marquer comme lu en base
      await this.messageService.markAsRead(messageId, user.sub);

      const conversationId = message.conversation_id;
      // Informer les autres participants
      const room = `conversation_${conversationId}`;
      this.server.to(room).emit('message_read', {
        messageId,
        conversationId,
        readerId: user.sub,
        readerName: user.username,
        readAt: new Date().toISOString(),
      });

      return { status: 'ok' };
    } catch (err) {
    console.error('[Gateway] Erreur après le log:', err);
  }

  }

}
