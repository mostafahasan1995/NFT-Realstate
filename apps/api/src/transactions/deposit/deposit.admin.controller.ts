import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { DepositService } from './deposit.service';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { PaginationQueryDto } from '../../common/pagination/dto/pagination-query.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';
import { ApproveDepositDto } from './dto/approve-deposit.dto';
import { RejectDepositDto } from './dto/reject-deposit.dto';
import { SearchQueryDto } from '../../common/pagination/dto/search-query.dto';
import { DepositDto } from './dto/deposit.dto';
import { SearchDepositDto } from './dto/search-deposit.dto';
import { Permission } from '../../auth/decorators/permission.decorator';
import { Permissions } from '../../auth/enums/permission.enum';
import { Action } from '../../auth/enums/action.enum';
import { PermissionsGuard } from '../../auth/guard/permission.guard';

@Roles(Role.Admin, Role.Manage)
@UseGuards(RolesGuard, PermissionsGuard)
@ApiTags('admin/deposits')
@Controller('admin/deposits')
export class AdminDepositController {
  constructor(private readonly depositService: DepositService) { }

  @Get()
  @Permission(Permissions.depositsAccess, [Action.read])
  async getAll(
    @Query() paginationQueryDto: PaginationQueryDto,
    @Query() filterQueryDto: SearchQueryDto
  ) {
    return await this.depositService.findWithPagination(
      paginationQueryDto,
      filterQueryDto
    );
  }


  @Get('search')
  @Permission(Permissions.depositsAccess, [Action.read])
  @UseInterceptors(ClassSerializerInterceptor)
  async searchDeposit(@Query() filterQueryDto: SearchDepositDto) {
    const result = await this.depositService.searchDeposit(filterQueryDto)
    const data = result.map((item) => new DepositDto(item))
    return { data }
  }


  @Patch(':id')
  @Permission(Permissions.depositsAccess, [Action.write])
  async update(
    @Param('id') id: string,
    @Body() updateDepositDto: UpdateDepositDto
  ) {
    return await this.depositService.updateDeposit(id, updateDepositDto);
  }

  @Post('approve/:id')
  @Permission(Permissions.depositsAccess, [Action.write])
  async approve(
    @Param('id') id: string,
    @Body() approveDepositDto: ApproveDepositDto
  ) {
    return await this.depositService.approveDeposit(id, approveDepositDto);
  }

  @Post('reject/:id')
  @Permission(Permissions.depositsAccess, [Action.write])
  async reject(
    @Param('id') id: string,
    @Body() rejectDepositDto: RejectDepositDto
  ) {
    return await this.depositService.rejectDeposit(id, rejectDepositDto);
  }
}
