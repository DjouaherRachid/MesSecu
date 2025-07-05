import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RsaKeyService } from './rsa-key.service';
import { UpdateRsaKeyDto } from './dto/update-rsa-key.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/ws-jwt.guard';

@Controller('keys/rsa')
export class RsaKeyController {
  constructor(private readonly rsaKeyService: RsaKeyService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  updateRsaKey(@Body() dto: UpdateRsaKeyDto, @Req() req: Request) {
    if (!req.user) {
      throw new Error('User not authenticated');
    }
    const userId = req.user['sub'];
    return this.rsaKeyService.updateRsaPublicKey(userId, dto.rsa_public_key);
  }

  @Get(':userId')
  getRsaKey(@Param('userId') userId: number) {
    return this.rsaKeyService.getRsaPublicKey(userId);
  }
}
