import { Conversation } from './conversation/conversation.entity';
// import { Message } from './node_modules/typescript/lib/typescript.d';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { ConversationModule } from './conversation/conversation.module';
import { ConversationParticipantModule } from './conversation/conversation-participant.module';
import { MessageModule } from './message/message.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      // ta config typeorm ici (host, port, username, password, database, entities, etc)
      autoLoadEntities: true,
      synchronize: true, // à utiliser avec précaution en prod
    }),
    UserModule,
    ConversationModule,
    ConversationParticipantModule,
    MessageModule,
  ],
})
export class AppModule {}
