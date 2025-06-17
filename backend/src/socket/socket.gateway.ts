// socket.gateway.ts
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
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  afterInit() {
    console.log('[Gateway] Initialisé');
  }

  @UseGuards(WsJwtGuard)
  handleConnection(client: Socket) {
    console.log('[Gateway] Client connecté :', client.id, client.data.user);
  }

  handleDisconnect(client: Socket) {
    console.log('[Gateway] Client déconnecté :', client.id);
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log('Message reçu de', client.data.user, ':', data);
    return { success: true };
  }
}
