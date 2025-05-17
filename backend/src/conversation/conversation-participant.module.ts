import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationParticipant } from './conversation-participant.entity';
import { ConversationParticipantService } from './conversation-participant.service';
import { ConversationParticipantController } from './conversation-participant.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ConversationParticipant])],
  providers: [ConversationParticipantService],
  controllers: [ConversationParticipantController],
  exports: [ConversationParticipantService],
})
export class ConversationParticipantModule {}
