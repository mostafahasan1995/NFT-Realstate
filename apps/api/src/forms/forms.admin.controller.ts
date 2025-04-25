import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from '../auth/enums/role.enum';
import { FormsService } from './forms.service';
import { FormType } from './enum/form-type.enum';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/forms')
@Controller('admin/forms')
export class FormsAdminController {
  constructor(private readonly formsService: FormsService) { }

}
