import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './message.entity';

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

  @Put(':id')
  update(@Param('id') id: number, @Body() updateMessage: Partial<Message>) {
    return this.messageService.update(id, updateMessage);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.messageService.remove(id);
  }
}
