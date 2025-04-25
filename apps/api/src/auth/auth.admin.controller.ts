import {
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
import { LocalAuthGuard } from './guard/local-auth.guard';
import { Public } from './decorators/public.decorator';
import { ProfileDto } from '../users/dto/profile.dto';

@ApiTags('admin/auth')
@Controller('admin/auth')
@UseInterceptors(ClassSerializerInterceptor)
export class AdminAuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() { user }): { token: string } {
    return this.authService.login(user);
  }

  @Get('me')
  @ApiBearerAuth()
  async me(@Request() { user }) {
    return new ProfileDto(user);
  }
  //
}
