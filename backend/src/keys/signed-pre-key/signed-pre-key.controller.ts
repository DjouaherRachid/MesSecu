import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { SignedPreKeysService } from './signed-pre-key.service';

@Controller('signed-pre-keys')
export class SignedPreKeysController {
  constructor(private readonly service: SignedPreKeysService) {}

  @Post()
  async create(@Body() body: { user_id: number; key_id: number; public_key: string; signature: string }) {
    return this.service.create({ user_id: body.user_id } as any, body);
  }

  @Get(':user_id')
  async findActive(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.service.findActiveByUserId(user_id);
  }
}
