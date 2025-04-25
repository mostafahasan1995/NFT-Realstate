import { Controller, UseGuards } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guard/roles.guard';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@Controller('admin/kyc-provider')
export class KycProviderAdminController { }
