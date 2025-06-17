import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { AuthModule } from '../auth/auth.module';
import { WsJwtGuard } from '../auth/guards/ws-jwt.guard';

@Module({
  imports: [AuthModule],
  providers: [SocketGateway, WsJwtGuard],
})
export class SocketModule {}
