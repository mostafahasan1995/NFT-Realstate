import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokensService } from '../tokens.service';
import { CheckManagedWallet } from '../../../../wallets/decorators/check-managed-wallet.decorator';
import { BurnTokensDto } from '../dto/burn-tokens.dto';
import { BalanceDto } from '../dto/balance.dto';
import { GUSDService } from './gusd.service';

@ApiTags('tokenization/tokens/gusd')
@Controller('tokenization/tokens/gusd')
export class GusdController {
  constructor(
    private readonly tokensService: TokensService

  ) { }

  @Post('burn-tokens')
  async burnTokens(
    @CheckManagedWallet() { walletId },
    @Body() burnTokensDto: BurnTokensDto
  ) {
    return await this.tokensService.burnTokens(walletId, 'GUSD', burnTokensDto);
  }

  @Post('balance')
  async getBalance(@Body() balanceDto: BalanceDto) {
    const balance = await this.tokensService.getBalance('GUSD', balanceDto);
    return { balance };
  }

  @Get('supply-cap')
  async getSupplyCap() {
    const supplyCap = await this.tokensService.getSupplyCap('GUSD');
    return { supplyCap };
  }
}
