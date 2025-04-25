import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Bitrix24Service } from './bitrix24.service';
import { Public } from '../auth/decorators/public.decorator';

@Public()
@Controller('bitrix24')
export class Bitrix24Controller {
  constructor(private readonly bitrix24Service: Bitrix24Service) {}

  @Get('oauth/callback')
  async getRefreshToken(@Query('code') code: string) {
    if (code) {
      try {
        return await this.bitrix24Service.getRefreshToken(code);
      } catch (error) {
        throw new BadRequestException('Error obtaining access token.');
      }
    } else {
      throw new BadRequestException(
        'No authorization code found in the request.'
      );
    }
  }
}
