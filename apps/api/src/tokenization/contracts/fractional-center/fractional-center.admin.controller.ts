import { Controller, UseGuards, Post, Get, Body, Put } from '@nestjs/common';
import { RolesGuard } from '../../../auth/guard/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { FractionalCenterService } from './fractional-center.service';
import { Role } from '../../../auth/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CheckManagedWallet } from '../../../wallets/decorators/check-managed-wallet.decorator';
import { RemoveFractionAddressDto } from './dto/remove-fraction-address.dto';
import { AddFractionAddressDto } from './dto/add-fraction-address.dto';
import { FractionalCenterAddressDto } from './dto/fractional-center-address.dto';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/tokenization/fractional-center')
@Controller('admin/tokenization/fractional-center')
export class AdminFractionalCenterController {
  constructor(
    private readonly fractionalCenterService: FractionalCenterService
  ) {}

  @Get('')
  async findAllCollections() {
    return await this.fractionalCenterService.findAll();
  }

  @Post('deploy')
  async deployContract(@CheckManagedWallet() { walletId }) {
    return await this.fractionalCenterService.deployContract(walletId);
  }

  @Put('activate')
  async activateFractionalCenter(
    @Body() fractionalCenterAddressDto: FractionalCenterAddressDto
  ) {
    return await this.fractionalCenterService.activateCenter(
      fractionalCenterAddressDto
    );
  }

  @Post('fraction-addresses')
  async getFractionAddresses(
    @Body() fractionalCenterAddressDto: FractionalCenterAddressDto
  ) {
    return await this.fractionalCenterService.getFractionAddresses(
      fractionalCenterAddressDto
    );
  }

  @Post('add-fraction-address')
  async AddFractionAddress(
    @CheckManagedWallet() { walletId },
    @Body() addFractionAddressDto: AddFractionAddressDto
  ) {
    return await this.fractionalCenterService.addFractionAddress(
      walletId,
      addFractionAddressDto
    );
  }

  @Post('remove-fraction-address')
  async removeAllowedFractionAddress(
    @CheckManagedWallet() { walletId },
    @Body() removeFractionAddressDto: RemoveFractionAddressDto
  ) {
    return await this.fractionalCenterService.removeFractionAddress(
      walletId,
      removeFractionAddressDto
    );
  }
}
