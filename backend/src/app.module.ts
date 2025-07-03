import { Message } from './message/message.entity';
import { Conversation } from './conversation/conversation.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConversationModule } from './conversation/conversation.module';
import { ConversationParticipantModule } from './conversation/conversation-participant.module';
import { MessageModule } from './message/message.module';
import { User } from './user/user.entity';
import { ConversationParticipant } from './conversation/conversation-participant.entity';
import { AuthModule } from './auth/auth.module';
import { SocketModule } from './socket/socket.module';
import { MessageRead } from './message/message-read.entity';
import { OneTimePreKey } from './keys/one-time-pre-key/one-time-pre-key.entity';
import { IdentityKey } from './keys/identity-key/identity-key.entity';
import { SignedPreKey } from './keys/signed-pre-key/signed-pre-key.entity';
import { Session } from './session/session.entity';
import { IdentityKeysModule } from './keys/identity-key/identity-key.module';
import { OneTimePreKeyModule } from './keys/one-time-pre-key/one-time-pre-key.module';
import { SignedPreKeysModule } from './keys/signed-pre-key/signed-pre-key.module';
import { SessionModule } from './session/session.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as 'mysql' | 'postgres' | 'sqlite',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT as string),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      entities: [User, Message, Conversation, ConversationParticipant, MessageRead, OneTimePreKey, IdentityKey, SignedPreKey, Session],
      synchronize: false,
    }),
    UserModule,
    ConversationModule,
    ConversationParticipantModule,
    MessageModule,
    AuthModule,
    SocketModule,
    IdentityKeysModule,
    OneTimePreKeyModule,
    SignedPreKeysModule,
    SessionModule,
  ],
})
export class AppModule {}
