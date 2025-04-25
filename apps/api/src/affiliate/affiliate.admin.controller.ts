import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ConfirmCommissionDto } from './dto/confirm-commission.dto';
import { GiftsService } from './gifts.service';
import { CheckManagedWallet } from '../wallets/decorators/check-managed-wallet.decorator';
import { Permission } from '../auth/decorators/permission.decorator';
import { Permissions } from '../auth/enums/permission.enum';
import { Action } from '../auth/enums/action.enum';
import { PermissionsGuard } from '../auth/guard/permission.guard';

@Roles(Role.Admin, Role.Manage)
@UseGuards(RolesGuard, PermissionsGuard)
@ApiBearerAuth()
@ApiTags('admin/affiliate')
@Controller('admin/affiliate')
export class AdminAffiliateController {
  constructor(
    private readonly giftsService: GiftsService
  ) { }

  @Get()
  @Permission(Permissions.commissionAccess, [Action.read])
  async findRequestedGifts() {
    return await this.giftsService.findRequestedGifts();
  }

  @Post('confirm')
  @Permission(Permissions.commissionAccess, [Action.write])
  async confirmCommission(@CheckManagedWallet() { walletId }, @Body() confirmCommission: ConfirmCommissionDto) {
    return await this.giftsService.confirmGifts(confirmCommission, walletId)
  }
}
