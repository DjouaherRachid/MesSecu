import { Controller, Get, Post, Body, Param, ParseIntPipe } from '@nestjs/common';
import { IdentityKeysService } from './identity-key.service';

@Controller('identity-keys')
export class IdentityKeysController {
  constructor(private readonly service: IdentityKeysService) {}

  @Post()
  async create(@Body() body: { user_id: number; public_key: string }) {
    return this.service.create({ user_id: body.user_id } as any, body.public_key);
  }

  @Get(':user_id')
  async findByUser(@Param('user_id', ParseIntPipe) user_id: number) {
    return this.service.findByUserId(user_id);
  }
}
