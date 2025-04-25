import { Controller, Get, Request } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { Membership } from './schemas/membership.schema';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiBearerAuth()
@ApiTags('membership')
@Controller('membership')
export class MembershipController {
  constructor(
    private readonly membershipService: MembershipService,
  ) { }

  @Get('all')
  async findAll(): Promise<Membership[]> {
    return await this.membershipService.findAll();
  }

  @Get()
  async getUserMembership(@Request() { user }) {
    return await this.membershipService.getUserMembership(user);
  }

}
