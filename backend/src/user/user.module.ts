import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConversationParticipant } from 'src/conversation/conversation-participant.entity';
import { OneTimePreKey } from 'src/keys/one-time-pre-key/one-time-pre-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ConversationParticipant,OneTimePreKey])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})

export class UserModule {}
