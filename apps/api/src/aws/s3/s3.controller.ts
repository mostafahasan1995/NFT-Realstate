import { Controller, UseGuards } from '@nestjs/common';
import { S3Service } from './s3.service';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guard/roles.guard';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiTags('admin/s3')
@Controller('admin/s3')
export class S3Controller {
  constructor(private readonly s3Service: S3Service) {}
}
