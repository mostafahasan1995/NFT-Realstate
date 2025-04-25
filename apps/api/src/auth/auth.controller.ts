import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { ApiKeyGuard } from './guard/api-key-auth.guard';
import { MessageDto } from './dto/message.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Public } from './decorators/public.decorator';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { SendVerifyEmailDto } from './dto/send-verify-email.dto';
import { Request as RequestType } from 'express';
import * as geoip from 'geoip-lite';
import { ProfileDto } from '../users/dto/profile.dto';

@ApiTags('auth')
@Controller('auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<{ message: string }> {
    return await this.authService.register(registerDto);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() { user }): { token: string } {
    return this.authService.login(user);
  }

  @Public()
  @Post('send-verify-email')
  async sendVerifyEmailRequest(@Request() { email }: SendVerifyEmailDto) {
    return await this.authService.sendVerifyEmailRequest(email);
  }

  @Public()
  @Post('verify-email')
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyEmail(verifyEmailDto);
  }

  @Get('me')
  @ApiBearerAuth()
  async me(@Request() { user }, @Request() req: RequestType) {
    const ip = req.headers['cf-connecting-ip'];
    const geo = geoip.lookup(ip);
    const countryCode = geo ? geo.country : 'Unknown';
    return new ProfileDto({ countryCode, ...user.toObject() })
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() { email }: ForgotPasswordDto) {
    return await this.authService.initiatePasswordReset(email);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(@Body() { resetToken, newPassword }: ResetPasswordDto) {
    return await this.authService.resetPassword(resetToken, newPassword);
  }

  @Post('change-password')
  async changePassword(
    @Request() { user },
    @Body() { currentPassword, newPassword }: ChangePasswordDto
  ) {
    return await this.authService.changePassword(
      user._id,
      currentPassword,
      newPassword
    );
  }

  @Public()
  @Post('google-auth')
  async googleAuthLogin(@Body() googleAuthDto: GoogleAuthDto) {
    return await this.authService.googleAuth(googleAuthDto);
  }

  @Get('protected')
  @ApiBearerAuth()
  protected(): MessageDto {
    return { message: 'ok' };
  }

  @Public()
  @UseGuards(ApiKeyGuard)
  @Get('validate-api-key')
  @ApiBearerAuth('apiKey')
  validateApiKey(): MessageDto {
    return { message: 'ok' };
  }
  //
}
