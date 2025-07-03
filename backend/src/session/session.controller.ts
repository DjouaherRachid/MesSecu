import { Controller, Post, Get, Delete, Param, Body, ParseIntPipe } from '@nestjs/common';
import { SessionService } from './session.service';

@Controller('sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post()
  createSession(
    @Body('userId', ParseIntPipe) userId: number,
    @Body('peerId', ParseIntPipe) peerId: number,
    @Body('sessionData') sessionData: any,
  ) {
    return this.sessionService.createSession(userId, peerId, sessionData);
  }

  @Get()
  findAll() {
    return this.sessionService.findAll();
  }

  @Get(':userId/:peerId')
  findByUserAndPeer(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('peerId', ParseIntPipe) peerId: number,
  ) {
    return this.sessionService.findByUserAndPeer(userId, peerId);
  }

  @Delete(':userId/:peerId')
  deleteByUserAndPeer(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('peerId', ParseIntPipe) peerId: number,
  ) {
    return this.sessionService.deleteByUserAndPeer(userId, peerId);
  }
}
