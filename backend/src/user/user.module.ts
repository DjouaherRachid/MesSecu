import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ConversationParticipant } from 'src/conversation/conversation-participant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ConversationParticipant])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})

export class UserModule {}
