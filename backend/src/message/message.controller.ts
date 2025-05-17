import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { MessageService } from './message.service';
import { Message } from './message.entity';

@Controller('messages')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  create(@Body() message: Partial<Message>) {
    return this.messageService.create(message);
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
