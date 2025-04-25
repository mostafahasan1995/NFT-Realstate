import { Controller, Body, UseGuards, Post, Get } from '@nestjs/common';
import { RolesGuard } from '../../../auth/guard/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { AssetIncomeDistributorService } from './asset-income-distributor.service';
import { DeployDto } from './dto/deploy.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../../../auth/enums/role.enum';
import { CheckManagedWallet } from '../../../wallets/decorators/check-managed-wallet.decorator';

@UseGuards(RolesGuard)
@Roles(Role.Admin)
@ApiBearerAuth()
@ApiTags('tokenization/income-distributors')
@Controller('tokenization/income-distributors')
export class AssetIncomeDistributorController {
  constructor(
    private readonly incomeDistributor: AssetIncomeDistributorService
  ) {}

  @Get()
  async findAllIncomeDistributor() {
    return await this.incomeDistributor.findAllIncomeDistributor();
  }

  @Post('deploy')
  async deployContract(
    @CheckManagedWallet() { walletId },
    @Body() deployDto: DeployDto
  ) {
    return await this.incomeDistributor.deployContract(walletId, deployDto);
  }
}
