import { Controller, Body, UseGuards, Post, Get } from '@nestjs/common';
import { RolesGuard } from '../../../auth/guard/roles.guard';
import { AssetFundraisingService } from './asset-fundraising.service';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Role } from '../../../auth/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckManagedWallet } from '../../../wallets/decorators/check-managed-wallet.decorator';
import { ExtendFundraisingDurationDto } from './dto/extend-fundraising-duration.dto';
import { TransferOwnershipDto } from './dto/transfer-ownership.dto';
import { FundraisingAddressDto } from './dto/fundraising-address.dto';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/tokenization/fundraising')
@Controller('admin/tokenization/fundraising')
export class AdminAssetFundraisingController {
  constructor(
    private readonly assetFundraisingService: AssetFundraisingService
  ) {}

  @Get()
  async findAllContracts() {
    return await this.assetFundraisingService.findAll();
  }

  @Post('transfer-ownership')
  async transferOwnership(
    @CheckManagedWallet() { walletId },
    @Body() transferOwnershipDto: TransferOwnershipDto
  ) {
    return await this.assetFundraisingService.transferOwnership(
      walletId,
      transferOwnershipDto
    );
  }

  @Post('extend-end-date')
  async extendFundraisingDuration(
    @CheckManagedWallet() { walletId },
    @Body() extendFundraisingDurationDto: ExtendFundraisingDurationDto
  ) {
    return await this.assetFundraisingService.extendFundraisingDuration(
      walletId,
      extendFundraisingDurationDto
    );
  }

  @Post('fail')
  async failFundraising(
    @CheckManagedWallet() { walletId },
    @Body() fundraisingAddressDto: FundraisingAddressDto
  ) {
    return await this.assetFundraisingService.failFundraising(
      walletId,
      fundraisingAddressDto
    );
  }
}
