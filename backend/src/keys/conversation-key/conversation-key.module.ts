import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConversationParticipant } from 'src/conversation/conversation-participant.entity';
import { OneTimePreKey } from 'src/keys/one-time-pre-key/one-time-pre-key.entity';
import { ConversationKey } from 'src/keys/conversation-key/conversation-keys.entity';
import { ConversationKeyService } from './conversation-key.service';
import { ConversationKeyController } from './conversation-key.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ ConversationParticipant, ConversationKey ])],
  providers: [ConversationKeyService],
  controllers: [ConversationKeyController],
  exports: [ConversationKeyService],
})

export class ConversationKeyModule {}
