import { Controller, Get, Post, Delete, Param, Body, UseGuards, Put, Req } from '@nestjs/common';
import { ConversationParticipantService } from './conversation-participant.service';
import { ConversationParticipant } from './conversation-participant.entity';
import { JwtAuthGuard } from 'src/auth/guards/ws-jwt.guard';

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

  @UseGuards(JwtAuthGuard)
  @Get('favorites/me')
  async getMyFavorites(@Req() req) {
    const userId = req.user.id;
    return this.cpService.findFavoritesByUser(userId);
  }

  @Get('conversation/:conversationId')
  findByConversation(@Param('conversationId') conversationId: number) {
    return this.cpService.findByConversation(conversationId);
  }

  @Delete(':conversationId/:userId')
  remove(@Param('conversationId') conversationId: number, @Param('userId') userId: number) {
    return this.cpService.remove(conversationId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/favorite')
  async toggleFavorite(
    @Param('id') conversationId: number,
    @Body('isFavorite') isFavorite: boolean,
    @Req() req
  ) {
    const userId = req.user.id;
    return this.cpService.toggleFavorite(conversationId, userId, isFavorite);
  }

}
