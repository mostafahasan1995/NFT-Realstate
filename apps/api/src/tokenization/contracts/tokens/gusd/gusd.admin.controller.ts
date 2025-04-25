import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TokensService } from '../tokens.service';
import { RolesGuard } from '../../../../auth/guard/roles.guard';
import { Roles } from '../../../../auth/decorators/roles.decorator';
import { Role } from '../../../../auth/enums/role.enum';
import { CheckManagedWallet } from '../../../../wallets/decorators/check-managed-wallet.decorator';
import { MinterRoleDto } from '../dto/minter-role.dto';
import { MintTokensDto } from '../dto/mint-tokens.dto';
import { TransferOwnershipDto } from '../dto/transfer-ownership.dto';
import { TransferDto } from '../dto/transfer.dto';
import { GUSDService } from './gusd.service';
import { TransferTokensByAddressDto } from '../dto/transfer-tokens-from-to-user.dto';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiTags('admin/tokenization/tokens/gusd')
@Controller('admin/tokenization/tokens/gusd')
export class GusdAdminController {
  constructor(
    private readonly gusdService: GUSDService,
    private readonly tokensService: TokensService
  ) { }

  @Post('deploy')
  async deployContract(@CheckManagedWallet() { walletId }) {
    return await this.gusdService.deployGusdContract(walletId);
  }

  @Post('transfer-ownership')
  async transferOwnership(
    @CheckManagedWallet() { walletId },
    @Body() transferOwnershipDto: TransferOwnershipDto
  ) {
    return await this.gusdService.transferGusdOwnership(
      walletId,
      transferOwnershipDto
    );
  }

  @Post('grant-minter-role')
  async grantMinterRole(
    @CheckManagedWallet() { walletId },
    @Body() minterRoleDto: MinterRoleDto
  ) {
    return await this.tokensService.grantMinterRole(
      walletId,
      'GUSD',
      minterRoleDto
    );
  }

  @Post('revoke-minter-role')
  async revokeMinterRole(
    @CheckManagedWallet() { walletId },
    @Body() minterRoleDto: MinterRoleDto
  ) {
    return await this.tokensService.revokeMinterRole(
      walletId,
      'GUSD',
      minterRoleDto
    );
  }

  @Post('mint-tokens')
  async mintTokens(
    @CheckManagedWallet() { walletId },
    @Body() mintTokensDto: MintTokensDto
  ) {
    return await this.tokensService.mintTokens(walletId, 'GUSD', mintTokensDto);
  }


  @Post('transfer')
  async transferTokens(
    @CheckManagedWallet() { walletId },
    @Body() transferData: TransferDto
  ) {
    return await this.tokensService.transfer(walletId, 'GUSD', transferData);
  }

  @Post('transfer-from-to-user')
  async transferTo(@Body() transferTokensDto: TransferTokensByAddressDto) {
    return await this.tokensService.transferFromToUser('GUSD', transferTokensDto);
  }

}
