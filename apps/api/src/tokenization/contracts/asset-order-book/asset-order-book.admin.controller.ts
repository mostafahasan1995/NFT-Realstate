import { Controller, Body, UseGuards, Post, Get } from '@nestjs/common';
import { RolesGuard } from '../../../auth/guard/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { AssetOrderBookService } from './asset-order-book.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../../../auth/enums/role.enum';
import { SetFeesDto } from './dto/set-fees.dto';
import { InitDto } from './dto/init.dto';
import { CheckManagedWallet } from '../../../wallets/decorators/check-managed-wallet.decorator';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/tokenization/order-books')
@Controller('admin/tokenization/order-books')
export class AdminAssetOrderBookController {
  constructor(private readonly assetOrderBookService: AssetOrderBookService) {}

  @Get()
  async findAll() {
    return await this.assetOrderBookService.findAll();
  }

  @Post('deploy')
  async deployContract(@CheckManagedWallet() { walletId }) {
    return await this.assetOrderBookService.deployContract(walletId);
  }

  @Post('init')
  async initContract(
    @CheckManagedWallet() { walletId },
    @Body() initDto: InitDto
  ) {
    return await this.assetOrderBookService.init(walletId, initDto);
  }

  @Post('setFees')
  async setFees(
    @CheckManagedWallet() { walletId },
    @Body() setFees: SetFeesDto
  ) {
    return await this.assetOrderBookService.setFees(walletId, setFees);
  }
}
