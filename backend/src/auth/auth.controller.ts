import { Controller, Post, Body, Res, Req, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register_user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterUserDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginUserDto, @Res() res: Response) {
    return this.authService.login(loginDto, res);
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    console.log('cookies:', req.cookies);

    if (!refreshToken) {
      throw new UnauthorizedException('Aucun refresh token trouvé');
    }

    const { accessToken } = await this.authService.refreshToken(refreshToken, res);

    return res.json({ accessToken });
  }

}
