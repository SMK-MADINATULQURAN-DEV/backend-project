import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { AtGuard } from '../../common/guards/at.guard';
import { RtGuard } from 'src/common/guards/rt.guard';

@Controller('auth') // Alamat: localhost:3000/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') // Alamat: localhost:3000/auth/register
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(AtGuard)
  @Get('profile') 
  async getProfile() {

    return this.authService.getProfile()
   
  }

  @Post('refresh')
  @UseGuards(RtGuard)
  async refresh(@Req() req) {
    const refreshToken = req.headers.authorization.split(' ')[1];
    const userId = req.headers.id;
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
