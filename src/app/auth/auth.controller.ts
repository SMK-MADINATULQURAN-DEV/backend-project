import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { AtGuard } from '../../common/guards/at.guard';
import { RtGuard } from 'src/common/guards/rt.guard';
import { ResendDto } from './dto/resend.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LoginGoogleDto } from './dto/login-google.dto';

@Controller('auth') // Alamat: localhost:3000/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register') // Alamat: localhost:3000/auth/register
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('resend-email-verifikasi') // Alamat: localhost:3000/auth/register
  async resendVerifikasiEmail(@Body() dto: ResendDto) {
    return this.authService.resendVerifikasiEmail(dto);
  }


  @Get('cek-verifikasi-email')
  async verifikasiEmail(
    @Query('token') token: string,
    @Query('userId') userId: string,
  ) {

    return this.authService.verifikasiEmail(userId, token)
   
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }


   @Post('login-google')
  async loginGoogle(@Body() dto: LoginGoogleDto) {
    return this.authService.loginGoogle(dto);
  }


  
  @Post('lupa-password')
  async lupaPassword(@Body() dto: ResendDto) {
    return this.authService.lupaPassword(dto);
  }

    
  @Post('reset-password')
  async resetPassword(@Body() dto:ResetPasswordDto ) {
    
    return this.authService.resetPassword(dto);
  }

  @UseGuards(AtGuard)
  @Get('profile')
  async getProfile() {
    return this.authService.getProfile();
  }

  @Post('refresh')
  @UseGuards(RtGuard)
  async refresh(@Req() req) {
    const refreshToken = req.headers.authorization.split(' ')[1];
    const userId = req.headers.id;
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
