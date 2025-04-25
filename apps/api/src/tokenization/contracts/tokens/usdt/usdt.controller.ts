import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokensService } from '../tokens.service';
import { BalanceDto } from '../dto/balance.dto';

@ApiTags('tokenization/tokens/usdt')
@Controller('tokenization/tokens/usdt')
export class UsdtController {
  constructor(
    private readonly tokensService: TokensService

  ) { }

  @Post('balance')
  async getBalance(@Body() balanceDto: BalanceDto) {
    const balance = await this.tokensService.getBalance('USDT', balanceDto);
    return { balance };
  }


}
