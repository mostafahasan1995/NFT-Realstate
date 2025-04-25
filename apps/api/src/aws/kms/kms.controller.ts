import { Controller, UseGuards } from '@nestjs/common';
import { KmsService } from './kms.service';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guard/roles.guard';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiTags('admin/kms')
@Controller('admin/kms')
export class KmsController {
  constructor(private readonly kmsService: KmsService) {}
}
