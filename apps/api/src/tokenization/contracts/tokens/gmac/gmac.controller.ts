import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokensService } from '../tokens.service';
import { CheckManagedWallet } from '../../../../wallets/decorators/check-managed-wallet.decorator';
import { BurnTokensDto } from '../dto/burn-tokens.dto';
import { BalanceDto } from '../dto/balance.dto';
import { GMACService } from './gmac.service';

@ApiTags('tokenization/tokens/gmac')
@Controller('tokenization/tokens/gmac')
export class GMACController {
  constructor(
    private readonly gmacService: GMACService,
    private readonly tokensService: TokensService

  ) { }

  @Post('burn-tokens')
  async burnTokens(
    @CheckManagedWallet() { walletId },
    @Body() burnTokensDto: BurnTokensDto
  ) {
    return await this.tokensService.burnTokens(walletId, 'GMAC', burnTokensDto);
  }

  @Post('balance')
  async getBalance(@Body() balanceDto: BalanceDto) {
    const balance = await this.tokensService.getBalance('GMAC', balanceDto);
    return { balance };
  }

  @Get('supply-cap')
  async getSupplyCap() {
    const supplyCap = await this.tokensService.getSupplyCap('GMAC');
    return { supplyCap };
  }
}
