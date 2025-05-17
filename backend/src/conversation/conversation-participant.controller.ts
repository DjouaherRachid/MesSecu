import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
import { ConversationParticipantService } from './conversation-participant.service';
import { ConversationParticipant } from './conversation-participant.entity';

@Controller('participants')
export class ConversationParticipantController {
  constructor(private readonly cpService: ConversationParticipantService) {}

  @Post()
  create(@Body() data: Partial<ConversationParticipant>) {
    return this.cpService.create(data);
  }

  @Get()
  findAll() {
    return this.cpService.findAll();
  }

  @Get('conversation/:conversationId')
  findByConversation(@Param('conversationId') conversationId: number) {
    return this.cpService.findByConversation(conversationId);
  }

  @Delete(':conversationId/:userId')
  remove(@Param('conversationId') conversationId: number, @Param('userId') userId: number) {
    return this.cpService.remove(conversationId, userId);
  }
}
