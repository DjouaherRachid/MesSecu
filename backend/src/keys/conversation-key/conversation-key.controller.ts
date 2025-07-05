import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  Req
} from '@nestjs/common';
import { ConversationKeyService } from './conversation-key.service';
import { Request } from 'express';
import { CreateConversationKeyDto } from './dto/create-conversation-key.dto';
import { JwtAuthGuard } from 'src/auth/guards/ws-jwt.guard';

@Controller('conversation-keys')
export class ConversationKeyController {
  constructor(private readonly service: ConversationKeyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateConversationKeyDto) {
    return this.service.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId/:userId')
  getEncryptedKey(
  @Param('conversationId') conversationId: number,
  @Param('userId') userId: number,
  ) {
    return this.service.getEncryptedKey(conversationId, userId);
}


  @UseGuards(JwtAuthGuard)
  @Delete(':conversationParticipantId')
  remove(@Param('conversationParticipantId') id: number) {
    return this.service.delete(id);
  }
}
