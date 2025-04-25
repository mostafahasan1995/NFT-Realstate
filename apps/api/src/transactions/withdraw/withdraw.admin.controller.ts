import { Body, ClassSerializerInterceptor, Controller, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../auth/enums/role.enum';
import { RolesGuard } from '../../auth/guard/roles.guard';
import { PaginationQueryDto } from '../../common/pagination/dto/pagination-query.dto';
import { SearchQueryDto } from '../../common/pagination/dto/search-query.dto';
import { ApproveWithdrawCash } from './dto/approve-withdraw-cash.dto';
import { RejectWithdrawCash } from './dto/reject-withdraw-cash.dto';
import { UpdateWithdrawDto } from './dto/update-withdraw.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { SearchWithdrawDto } from './dto/search-withdraw.dto';
import { Permissions } from '../../auth/enums/permission.enum';
import { Action } from '../../auth/enums/action.enum';
import { Permission } from '../../auth/decorators/permission.decorator';
import { PermissionsGuard } from '../../auth/guard/permission.guard';

@Roles(Role.Admin, Role.Manage)
@UseGuards(RolesGuard, PermissionsGuard)
@ApiBearerAuth()
@ApiTags('admin/withdraws')
@Controller('admin/withdraws')
export class AdminWithdrawController {
  constructor(private readonly withdrawService: WithdrawService) { }

  @Get()
  @Permission(Permissions.withdrawsAccess, [Action.read])
  async getAll(@Query() paginationQueryDto: PaginationQueryDto, @Query() filterQueryDto: SearchQueryDto) {
    return await this.withdrawService.findWithPagination(paginationQueryDto, filterQueryDto);
  }

  @Get('search')
  @Permission(Permissions.withdrawsAccess, [Action.read])
  @UseInterceptors(ClassSerializerInterceptor)
  async searchWithdraw(@Query() searchWithdrawDto: SearchWithdrawDto) {
    const result = await this.withdrawService.searchWithdraw(searchWithdrawDto)
    const data = result.map((item) => new WithdrawDto(item))
    return { data };
  }

  @Patch(':id')
  @Permission(Permissions.withdrawsAccess, [Action.write])
  async update(@Param('id') id: string, @Body() updateWithdrawDto: UpdateWithdrawDto) {
    return await this.withdrawService.updateWithdraw(id, updateWithdrawDto);
  }

  @Post('approve/:id')
  @Permission(Permissions.withdrawsAccess, [Action.write])
  async approve(@Param('id') id: string, @Body() approveWithdrawCash: ApproveWithdrawCash) {
    return await this.withdrawService.approveWithdrawCash(id, approveWithdrawCash);
  }

  @Post('reject/:id')
  @Permission(Permissions.withdrawsAccess, [Action.write])
  async reject(@Param('id') id: string, @Body() rejectWithdrawCash: RejectWithdrawCash) {
    return await this.withdrawService.rejectWithdrawCash(id, rejectWithdrawCash);
  }
}
