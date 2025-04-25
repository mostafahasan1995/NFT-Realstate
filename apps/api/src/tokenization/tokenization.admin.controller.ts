import { Controller, UseGuards, Post, Body, Param, Get } from '@nestjs/common';
import { TokenizationService } from './tokenization.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { CheckManagedWallet } from '../wallets/decorators/check-managed-wallet.decorator';
import { DeployAssetNftDto } from './dto/deploy-asset-nft.dto';
import { DeployAssetFundraisingDto } from './dto/deploy-asset-fundraising.dto';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/tokenization')
@Controller('admin/tokenization')
export class AdminTokenizationController {
  constructor(private readonly tokenizationService: TokenizationService) { }

  // Deploy NFT contract for asset
  @Post('assets/:assetId/deploy-nft')
  @ApiOperation({ summary: 'Deploy an asset NFT' })
  async deployAssetNft(
    @CheckManagedWallet() { walletId },
    @Param('assetId') assetId: string,
    @Body()
    deployAssetNftDto: DeployAssetNftDto
  ) {
    return await this.tokenizationService.deployAssetNft(
      walletId,
      assetId,
      deployAssetNftDto
    );
  }

  // Deploy fraction contract for asset
  @Post('assets/:assetId/deploy-fraction')
  @ApiOperation({ summary: 'Deploy an asset fraction' })
  async deployAssetFraction(
    @CheckManagedWallet() { walletId },
    @Param('assetId') assetId: string
  ) {
    return await this.tokenizationService.deployAssetFraction(
      walletId,
      assetId
    );
  }

  // Deploy fundraising for asset
  @Post('assets/:assetId/deploy-fundraising')
  @ApiOperation({ summary: 'Deploy fundraising for an asset' })
  async deployAssetFundraising(
    @CheckManagedWallet() { walletId },
    @Param('assetId') assetId: string,
    @Body() deployAssetFundraisingDto: DeployAssetFundraisingDto
  ) {
    return await this.tokenizationService.deployAssetFundraising(
      walletId,
      assetId,
      deployAssetFundraisingDto
    );
  }


  // Initialize fraction contract for asset
  @Post('assets/:assetId/init-fraction')
  @ApiOperation({ summary: 'Initialize an asset fraction' })
  async initAssetFraction(
    @CheckManagedWallet() { walletId },
    @Param('assetId') assetId: string
  ) {
    return await this.tokenizationService.initAssetFraction(walletId, assetId);
  }

  // Deploy orderbook for asset
  @Post('assets/:assetId/deploy-order-book')
  @ApiOperation({ summary: 'Deploy an asset orderbook' })
  async deployAssetOrderBook(
    @CheckManagedWallet() { walletId },
    @Param('assetId') assetId: string
  ) {
    return await this.tokenizationService.deployAssetOrderBook(
      walletId,
      assetId
    );
  }

  // Initialize orderbook for asset
  @Post('assets/:assetId/init-order-book')
  @ApiOperation({ summary: 'Initialize an asset orderbook' })
  async initOrderBook(
    @CheckManagedWallet() { walletId },
    @Param('assetId') assetId: string
  ) {
    return await this.tokenizationService.initAssetOrderBook(walletId, assetId);
  }

  @Get('fractions/summary/assets/:assetId')
  async getSummaryFractionByAssetId(@Param('assetId') assetId: string) {
    const summary = await this.tokenizationService.getSummaryFractionByAssetId(
      assetId
    );
    return { summary };
  }
}
