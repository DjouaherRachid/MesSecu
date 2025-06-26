import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { MessageModule } from 'src/message/message.module';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [AuthModule,MessageModule, ConversationModule],
  providers: [SocketGateway, WsJwtGuard],
})
export class SocketModule {}
