import {
  Controller,
  Request,
  Get,
  Body,
  Patch,
  UseInterceptors,
  ClassSerializerInterceptor,
  Put,
  Query,
} from '@nestjs/common';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ProfileDto } from './dto/profile.dto';
import { Public } from '../auth/decorators/public.decorator';
import { VerifyUserDto } from './dto/verify-user.dto';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';

@ApiBearerAuth()
@ApiTags('users')
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get('profile')
  async getUserProfile(@Request() { user }) {
    const profile = await this.usersService.findOne({ _id: user._id });
    return new ProfileDto(profile);
  }

  @Patch('profile')
  async updateUserProfile(
    @Request() { user },
    @Body() updateUserProfileDto: UpdateUserProfileDto
  ) {
    const profile = await this.usersService.updateProfile(
      user,
      updateUserProfileDto
    );
    return new ProfileDto(profile);
  }


  @Public()
  @Get('total')
  async getUserCount() {
    return await this.usersService.countUser();
  }

  @Put('verify-identity')
  async verifyUser(@Body() verifyUserDto: VerifyUserDto, @Request() { user }) {
    return await this.usersService.verifyUser(verifyUserDto, user);
  }

  @Put('verify-identity-photoCamera')
  async verifyUserWithPhotoCamera(@Body() verifyUserDto: VerifyUserDto, @Request() { user }) {
    return await this.usersService.verifyUser(verifyUserDto, user);
  }
}
