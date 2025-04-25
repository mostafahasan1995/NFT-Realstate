import { Controller, Body, UseGuards, Post, Get } from '@nestjs/common';
import { AssetsCollectionService } from './assets-collection.service';
import { RolesGuard } from '../../../auth/guard/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../../../auth/enums/role.enum';
import { CheckManagedWallet } from '../../../wallets/decorators/check-managed-wallet.decorator';
import { DeployAssetCollectionContractDto } from './dto/deploy-asset-collection.dto';
import { MintTokenDto } from './dto/mint-token.dto';
import { ApproveFractionAddressDto } from './dto/approve-fraction-address.dto';

@UseGuards(RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('admin/tokenization/assets-collection')
@Controller('admin/tokenization/assets-collection')
export class AdminAssetsCollectionController {
  constructor(
    private readonly assetsCollectionService: AssetsCollectionService
  ) {}

  @Get('collections')
  async findAllCollections() {
    return await this.assetsCollectionService.findAllCollections();
  }

  @Get('tokens')
  async findAllTokens() {
    return await this.assetsCollectionService.findAllTokens();
  }

  @Post('deploy-collection')
  async deployAssetCollection(
    @CheckManagedWallet() { walletId },
    @Body() deployAssetCollectionContractDto: DeployAssetCollectionContractDto
  ) {
    return await this.assetsCollectionService.deployAssetCollection(
      walletId,
      deployAssetCollectionContractDto
    );
  }

  @Post('mint-token')
  async mintToken(
    @CheckManagedWallet() { walletId },
    @Body() mintTokenDto: MintTokenDto
  ) {
    return await this.assetsCollectionService.mintToken(walletId, mintTokenDto);
  }

  @Post('approve-fraction-address')
  async approveFractionAddress(
    @CheckManagedWallet() { walletId },
    @Body()
    approveFractionAddressDto: ApproveFractionAddressDto
  ) {
    return await this.assetsCollectionService.approveFractionAddress(
      walletId,
      approveFractionAddressDto
    );
  }
}
