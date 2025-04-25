import { Controller, Body, UseGuards, Post, Param, Get } from '@nestjs/common';
import { AssetFractionsTokenService } from './asset-fractions-token.service';
import { RolesGuard } from '../../../auth/guard/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BalanceOfDto } from './dto/balanceOf.dto';
import { Role } from '../../../auth/enums/role.enum';
import { CheckManagedWallet } from '../../../wallets/decorators/check-managed-wallet.decorator';
import { DeployAssetFractionsTokenDto } from './dto/deploy-asset-fractions-token.dto';
import { InitDto } from './dto/init.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { TransferTokensByAddressDto } from './dto/transfet-tokens-by-user-email';
import { BurnTokensDto } from './dto/burn-tokens.dto';

@UseGuards(RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('tokenization/fractions')
@Controller('tokenization/fractions')
export class AssetFractionsTokenController {
  constructor(
    private readonly assetFractionsTokenService: AssetFractionsTokenService
  ) { }

  @Post('deploy')
  async deployAssetCollection(
    @CheckManagedWallet() { walletId },
    @Body() deployAssetFractionsTokenDto: DeployAssetFractionsTokenDto
  ) {
    return await this.assetFractionsTokenService.deploy(
      walletId,
      deployAssetFractionsTokenDto
    );
  }

  @Post('init')
  async init(@CheckManagedWallet() { walletId }, @Body() initDto: InitDto) {
    return await this.assetFractionsTokenService.init(walletId, initDto);
  }

  @Post('transfer-ownership')
  async transferOwnership(
    @CheckManagedWallet() { walletId },
    @Body() transferOwnershipDto: TransferOwnershipDto
  ) {
    return await this.assetFractionsTokenService.transferOwnership(
      walletId,
      transferOwnershipDto
    );
  }

  @Post('balanceOf')
  async balanceOf(@Body() balanceOfDto: BalanceOfDto) {
    const balance = await this.assetFractionsTokenService.balanceOf(
      balanceOfDto
    );
    return {
      balance,
    };
  }

  @Get(':fractionAddress/summary')
  async summary(@Param('fractionAddress') fractionAddress: string) {
    return await this.assetFractionsTokenService.getSummaryFraction(
      fractionAddress
    );
  }

  @Post('transfer-from-to-user')
  async transferTo(@Body() transferTokensDto: TransferTokensByAddressDto) {
    return await this.assetFractionsTokenService.transferFromToUser(transferTokensDto);
  }

  @Post('burn')
  async burnTokens(@CheckManagedWallet() { walletId }, @Body() burnTokensDto: BurnTokensDto) {
    return await this.assetFractionsTokenService.burnTokens(walletId, burnTokensDto);
  }
}
