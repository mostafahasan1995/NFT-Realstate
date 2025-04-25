import { Controller, Get, Post, Body, Param, Request } from '@nestjs/common';
import { TokenizationService } from './tokenization.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WalletAddressDto } from './dto/wallet-address.dto';
import { Public } from '../auth/decorators/public.decorator';
import { FractionBalanceDto } from './dto/fraction-balance.dto';

@ApiBearerAuth()
@ApiTags('tokenization')
@Controller('tokenization')
export class TokenizationController {
  constructor(private readonly tokenizationService: TokenizationService) { }

  @Post('dashboard')
  async getWalletDashboard(
    @Body() { walletAddress }: WalletAddressDto
  ): Promise<object> {
    return this.tokenizationService.getUserDashboardByWalletAddress(
      walletAddress
    );
  }

  @Post('fractions/my-fractions')
  async getUserFractions(@Body() { walletAddress }: WalletAddressDto) {
    return await this.tokenizationService.getUserFractionsWithStatusAndTotalPrice(
      walletAddress
    );
  }


  @Get('fractions')
  async getUserFractionsAllWallets(@Request() { user }) {
    return await this.tokenizationService.getUserFractionsAllWallets(user);
  }

  @Get('assets/summary')
  async getAssetsSummary(@Request() { user }) {
    return await this.tokenizationService.getAssetsSummary(user);
  }

  @Post('fractions/my-expected-profit')
  async getUserExpectedProfit(@Body() { walletAddress }: WalletAddressDto) {
    return await this.tokenizationService.getUserExpectedProfit(walletAddress);
  }

  @Post('fractions/balance')
  async getMyFractionsByAssetId(
    @Body() fractionBalanceDto: FractionBalanceDto
  ) {
    const balance = await this.tokenizationService.getUserFractionsByAssetId(
      fractionBalanceDto
    );
    return balance;
  }

  @Public()
  @Get('fractions/summary/assets/:assetId')
  async getSummaryFractionByAssetId(@Param('assetId') assetId: string) {
    const summary = await this.tokenizationService.
      getSummaryFractionByAssetId(assetId);
    return { summary };
  }
}
