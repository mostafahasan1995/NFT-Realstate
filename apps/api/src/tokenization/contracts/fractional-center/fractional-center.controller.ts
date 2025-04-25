import { Controller, Post, Get, Body } from '@nestjs/common';
import { FractionalCenterService } from './fractional-center.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FractionalAndWalletDto } from './dto/fractional-and-wallet.dto';

@ApiBearerAuth()
@ApiTags('tokenization/fractional-center')
@Controller('tokenization/fractional-center')
export class FractionalCenterController {
  constructor(
    private readonly fractionalCenterService: FractionalCenterService
  ) {}

  @Get('active')
  async getActiveFractionalCenter() {
    return await this.fractionalCenterService.getActiveCenter();
  }

  @Post('fractions/balance')
  async getBalances(@Body() fractionalAndWalletDto: FractionalAndWalletDto) {
    return await this.fractionalCenterService.getFractionsBalance(
      fractionalAndWalletDto
    );
  }

  @Post('fractions/balance/market-enabled')
  async balancesOf(@Body() fractionalAndWalletDto: FractionalAndWalletDto) {
    return await this.fractionalCenterService.getFractionsBalanceWithEnabledSecondaryMarket(
      fractionalAndWalletDto
    );
  }

  @Post('fractions/orders')
  async getOrders(@Body() fractionalAndWalletDto: FractionalAndWalletDto) {
    return await this.fractionalCenterService.getOrders(fractionalAndWalletDto);
  }
}
