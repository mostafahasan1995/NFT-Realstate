import {
  Controller,
  UseGuards,
  Get,
  Param,
  Post,
  Body,
  Put,
} from '@nestjs/common';

import {Roles} from '../auth/decorators/roles.decorator';
import {RolesGuard} from '../auth/guard/roles.guard';
import {ApiBearerAuth, ApiExcludeController} from '@nestjs/swagger';
import {Role} from '../auth/enums/role.enum';
import {Bitrix24Service} from './bitrix24.service';
import {CreateLeadDto} from './dto/create-lead.dto';
import {UpdateLeadDto} from './dto/update-lead.dto';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiExcludeController()
@ApiBearerAuth()
@Controller('admin/bitrix24')
export class AdminBitrix24Controller {
  constructor(private readonly bitrix24Service: Bitrix24Service) {}

  @Post('leads')
  async createLead(@Body() createLeadDto: CreateLeadDto) {
    return this.bitrix24Service.createLead(createLeadDto);
  }

  @Get('leads')
  async list() {
    return this.bitrix24Service.getLeads();
  }

  @Get('leads/:id')
  async getLead(@Param('id') id: number) {
    return this.bitrix24Service.getLeadById(id);
  }

  @Put('leads/:id')
  async updateLead(
    @Param('id') id: number,
    @Body() updateLeadDto: UpdateLeadDto
  ) {
    return this.bitrix24Service.updateLeadById(id, updateLeadDto);
  }
}
