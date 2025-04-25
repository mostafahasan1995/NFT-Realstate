import { Controller, Get, UseGuards, Body, Param, Patch, Query, NotFoundException, Put, UseInterceptors, ClassSerializerInterceptor, BadRequestException } from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserByAdminDto } from './dto/update-user-by-admin.dto';
import { FilterQueryDto } from './dto/filter-query.dto';
import { Role } from '../auth/enums/role.enum';
import { UpdateUserRoleDto } from './dto/update-role.dto';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';
import { UserDto } from './dto/user.dto';
import { WalletAddressQueryDto } from './dto/addrss-query.dto';
import { Permissions } from '../auth/enums/permission.enum';
import { Action } from '../auth/enums/action.enum';
import { Permission } from '../auth/decorators/permission.decorator';
import { PermissionsGuard } from '../auth/guard/permission.guard';
import { UpdateUserPermissionsDto } from './dto/update-permission.dto';
import { KycStatus } from './enums/kyc-status';

@Roles(Role.Admin, Role.Manage)
@UseGuards(RolesGuard, PermissionsGuard)
@ApiBearerAuth()
@ApiTags('admin/users')
@Controller('admin/users')
@UseInterceptors(ClassSerializerInterceptor)
export class AdminUsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @Permission(Permissions.usersAccess, [Action.read])
  async findAll(@Query() paginationQueryDto: PaginationQueryDto, @Query() filterQueryDto: FilterQueryDto) {
    const data = await this.usersService.findAll(paginationQueryDto, filterQueryDto);
    const serializedUsers = data.data.map((user) => new UserDto(user));
    return {
      data: serializedUsers,
      pagination: data.pagination,
    };
  }

  @Get('find-by-wallet-address')
  @Permission(Permissions.usersAccess, [Action.read])
  async findUserByWalletAddress(@Query() walletAddressQueryDto: WalletAddressQueryDto) {
    const data = await this.usersService.findUserByWalletAddress(walletAddressQueryDto);
    const serializedUsers = data.map((user) => new UserDto(user));
    return { data: serializedUsers };
  }

  @Get('kycStatus/:status')
  @Permission(Permissions.usersAccess, [Action.read])
  async getUsersWithKycNotConfirmed(@Query() paginationQueryDto: PaginationQueryDto,@Param('status') status:KycStatus) {
    const data = await this.usersService.findUsersWithKycNotConfirmed(paginationQueryDto,status);
    
    const transformedData = data.data.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      claim: {
        nationality: user.claim.nationality,
        idCardImage: user.claim.idCardImage,
        residence: user.claim.residence,
        photoCamera: user.claim.photoCamera,
        status: user.claim.status
      },
      createdAt: user.createdAt
    }));

    return {
      data: transformedData,
      pagination: data.pagination
    };
  }

  @Get(':id')
  @Permission(Permissions.usersAccess, [Action.read])
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne({ _id: id });
    return this.validateAndReturnUserDto(user)
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserByAdminDto) {
    const user = await this.usersService.update(id, updateUserDto);
    return this.validateAndReturnUserDto(user)
  }

  @Put(':id/update-role')
  async updateRole(@Param('id') id: string, @Body() updateUserPermissionDto: UpdateUserRoleDto) {
    const user = await this.usersService.update(id, updateUserPermissionDto);
    return this.validateAndReturnUserDto(user)
  }

  @Put(':id/update-permissions')
  async updatePermissions(@Param('id') id: string, @Body() updateUserPermissionDto: UpdateUserPermissionsDto[]) {
    if (!Array.isArray(updateUserPermissionDto))
      throw new BadRequestException('the date must by an array')
    const user = await this.usersService.updateUserPermissions(id, updateUserPermissionDto);
    return this.validateAndReturnUserDto(user)
  }

  private validateAndReturnUserDto(user) {
    if (!user)
      throw new NotFoundException('User not found');
    return new UserDto(user);
  }
}
