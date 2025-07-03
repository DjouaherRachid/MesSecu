import { Controller, Get, Post, Body, Param, Patch, ParseIntPipe } from '@nestjs/common';
import { KeyService } from './one-time-pre-key.service';

@Controller('one-time-pre-keys')
export class OneTimePreKeyController {
  constructor(private readonly keyService: KeyService) {}

  @Post()
  async create(@Body() body: { user_id: number; key_id: number; public_key: string }) {
    return this.keyService.create({ user_id: body.user_id } as any, body);
  }

  @Get(':userId')
  async findAllForUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.keyService.findAllForUser(userId);
  }

  @Get(':userId/available')
  async findAvailableKey(@Param('userId', ParseIntPipe) userId: number) {
    return this.keyService.findAvailableKey(userId);
  }

  @Patch(':keyId/used')
  async markAsUsed(@Param('keyId', ParseIntPipe) keyId: number) {
    await this.keyService.markAsUsed(keyId);
    return { message: 'Key marked as used' };
  }
}