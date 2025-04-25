import { Controller, Body, Post } from '@nestjs/common';
import { AssetFractionsTokenService } from './asset-fractions-token.service';

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CheckManagedWallet } from '../../../wallets/decorators/check-managed-wallet.decorator';
import { TransferTokensDto } from './dto/transfet-tokens';

@ApiBearerAuth()
@ApiTags('user/tokenization/fractions')
@Controller('user/tokenization/fractions')
export class UserAssetFractionsTokenController {
  constructor(
    private readonly assetFractionsTokenService: AssetFractionsTokenService
  ) { }

  @Post('transfer-to')
  async transferTo(@CheckManagedWallet() { walletId }, @Body() transferTokensDto: TransferTokensDto) {
    return await this.assetFractionsTokenService.TransferTokens(walletId, transferTokensDto);
  }

}
