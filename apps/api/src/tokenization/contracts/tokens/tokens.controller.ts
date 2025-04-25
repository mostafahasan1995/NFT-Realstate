import { Controller, UseGuards, Post, Body } from '@nestjs/common';
import { RolesGuard } from '../../../auth/guard/roles.guard';
import { Roles } from '../../../auth/decorators/roles.decorator';
import { TokensService } from './tokens.service';
import { Role } from '../../../auth/enums/role.enum';
import { TransferDto } from './dto/transfer.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('tokenization/tokens')
@Controller('tokenization/tokens')
export class TokensController {
  constructor(private readonly tokensService: TokensService) {}

  @Roles(Role.Admin)
  @Post('transfer/eth')
  async transferEth(@Body() transferDto: TransferDto) {
    return await this.tokensService.transferEth(transferDto);
  }
}
