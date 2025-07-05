import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, Req, ParseIntPipe, ForbiddenException, Headers, UnauthorizedException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { JwtAuthGuard } from '../auth/guards/ws-jwt.guard';
import { Request } from 'express';

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;
console.log('INTERNAL_API_KEY:', INTERNAL_API_KEY);

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() user: Partial<User>) {
    return this.userService.create(user);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request & { user: any }) {
    const user = req.user; 
    return user;
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Get('me/contacts')
  @UseGuards(JwtAuthGuard)
  async getMyContacts(@Req() req: Request & { user: any }) {
    return this.userService.findMyContacts(req.user.user_id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateUser: Partial<User>) {
    return this.userService.update(id, updateUser);
  }
  
  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Headers('x-internal-api-key') apiKey?: string,
  ) {
    if (apiKey !== INTERNAL_API_KEY) {
      throw new UnauthorizedException('Invalid internal API key');
    }
    return this.userService.remove(id);
  }

}
