import { Controller, UseGuards } from '@nestjs/common';
import { ethers } from 'ethers';
import { Roles } from 'apps/api/src/auth/decorators/roles.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'apps/api/src/auth/enums/role.enum';
import { RolesGuard } from 'apps/api/src/auth/guard/roles.guard';
import { TokenVestingService } from './token-vesting.service';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/tokenization/vesting-token')
@Controller('admin/tokenization/vesting-token')
export class TokenVestingAdminController {

  constructor(private readonly tokenVestingService: TokenVestingService) { }


}
