import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, Query, Req, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './message.entity';
import { JwtAuthGuard } from 'src/auth/guards/ws-jwt.guard';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() message: Partial<Message>) {
    return this.messageService.create(message);
  }

  @Post(':id/read')
  async markMessageAsRead(
    @Param('id', ParseIntPipe) messageId: number,
    @Body('userId') userId: number,
  ) {
    return this.messageService.markAsRead(messageId, userId);
  }

  @Get()
  findAll() {
    return this.messageService.findAll();
  }

  @Get('conversation/:conversationId')
  findByConversation(@Param('conversationId') conversationId: number) {
    return this.messageService.findByConversation(conversationId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversation/:conversationId/paginated')
  @Get('me')
  async getMessagesPaginated(
    @Req() req,
    @Param('conversationId', ParseIntPipe) conversationId: number,
    @Query('before') before?: string, 
    @Query('limit') limit = 20,
  ) {
    const userId = req.user.sub;
    return this.messageService.getMessagesPaginated(userId, conversationId, before, limit);
  }


  @Put(':id')
  update(@Param('id') id: number, @Body() updateMessage: Partial<Message>) {
    return this.messageService.update(id, updateMessage);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.messageService.remove(id);
  }
}
