import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { MessageRead } from './message-read.entity'; 
import { Conversation } from 'src/conversation/conversation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, MessageRead, Conversation])],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [MessageService],
})
export class MessageModule {}
