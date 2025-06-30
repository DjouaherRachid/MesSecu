import { forwardRef, Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';
import { MessageModule } from 'src/message/message.module';
import { ConversationModule } from 'src/conversation/conversation.module';

@Module({
  imports: [AuthModule,MessageModule, forwardRef(() => ConversationModule)],
  providers: [SocketGateway, WsJwtGuard],
  exports: [SocketGateway],  
})
export class SocketModule {}
