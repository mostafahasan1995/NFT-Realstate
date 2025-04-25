import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { SimpleSwapService } from './simple-swap.service';

import { CheckManagedWallet } from '../../../wallets/decorators/check-managed-wallet.decorator';
import { DeployContractDto } from './dto/deploy-contract.dto';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { Role } from '../../../auth/enums/role.enum';
import { SetPriceDto } from './dto/set-price.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../../auth/guard/roles.guard';
import { GetPriceDto } from './dto/get-price.dto';

@UseGuards(RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('tokenization/simple-swap')
@Controller('tokenization/simple-swap')
export class SimpleSwapController {
  constructor(private readonly simpleSwapService: SimpleSwapService) {}

  @Post('deploy')
  async deploy(
    @CheckManagedWallet() { walletId },
    @Body() deployContractDto: DeployContractDto
  ) {
    const address = await this.simpleSwapService.deployContract(
      walletId,
      deployContractDto
    );

    return { address };
  }

  @Post('set-price')
  async setPrice(
    @CheckManagedWallet() { walletId },
    @Body() setPriceDto: SetPriceDto
  ) {
    const tx = await this.simpleSwapService.setPrice(walletId, setPriceDto);

    return { tx };
  }

  @Post('get-price')
  async getPrice(
    @CheckManagedWallet() { walletId },
    @Body() getPriceDto: GetPriceDto
  ) {
    const price = await this.simpleSwapService.getPrice(walletId, getPriceDto);

    return { price };
  }
}
