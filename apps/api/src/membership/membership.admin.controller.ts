import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { Membership } from './schemas/membership.schema';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { AddUserToMembershipDto } from './dto/add-user-to-membership.dto';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/membership')
@Controller('admin/membership')
export class MembershipAdminController {
  constructor(private readonly membershipService: MembershipService) { }

  @Post()
  async create(@Body() createMembershipDto: CreateMembershipDto): Promise<Membership> {
    return this.membershipService.create(createMembershipDto);
  }

  @Get()
  async findAll(): Promise<Membership[]> {
    return this.membershipService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Membership> {
    return this.membershipService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateMembershipDto: UpdateMembershipDto): Promise<Membership> {
    return this.membershipService.update(id, updateMembershipDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<Membership> {
    return this.membershipService.delete(id);
  }

  @Post('add-user')
  async addUserToMembership(@Body() AddUserToMembershipDto: AddUserToMembershipDto): Promise<{ message: string }> {
    return await this.membershipService.addUserToMembership(AddUserToMembershipDto);
  }

}
