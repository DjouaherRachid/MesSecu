import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Conversation } from './conversation.entity';
import { JwtAuthGuard } from 'src/auth/guards/ws-jwt.guard';
import { CreateConversationDto } from 'src/auth/dto/conversation-dto';

@Controller('conversations')
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() conversationDto: CreateConversationDto, @Req() req) {
    const creatorUserId = req.user.sub;
    console.log('[ConversationController] req.user:',req.user);
    return this.conversationService.create(conversationDto, creatorUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async findMyConversations(@Req() req) {
    const userId = req.user.sub;
    return this.conversationService.findByUser(userId);
  }

  @Get()
  findAll() {
    return this.conversationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.conversationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateConversation: Partial<Conversation>) {
    return this.conversationService.update(id, updateConversation);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.conversationService.remove(id);
  }
}
