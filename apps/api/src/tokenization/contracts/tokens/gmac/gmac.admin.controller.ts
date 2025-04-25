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
import { GMACService } from './gmac.service';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiTags('admin/tokenization/tokens/gmac')
@Controller('admin/tokenization/tokens/gmac')
export class GMACAdminController {
  constructor(
    private readonly gmacService: GMACService,
    private readonly tokenService: TokensService
  ) { }

  @Post('deploy')
  async deployContract(@CheckManagedWallet() { walletId }) {
    return await this.gmacService.deployGmacContract(walletId);
  }

  @Post('transfer-ownership')
  async transferOwnership(
    @CheckManagedWallet() { walletId },
    @Body() transferOwnershipDto: TransferOwnershipDto
  ) {
    return await this.gmacService.transferGmacOwnership(walletId, transferOwnershipDto);
  }

  @Post('grant-minter-role')
  async grantMinterRole(
    @CheckManagedWallet() { walletId },
    @Body() minterRoleDto: MinterRoleDto
  ) {
    return await this.tokenService.grantMinterRole(
      walletId,
      'GMAC',
      minterRoleDto
    );
  }

  // @Post('revoke-minter-role')
  // async revokeMinterRole(
  //   @CheckManagedWallet() { walletId },
  //   @Body() minterRoleDto: MinterRoleDto
  // ) {
  //   return await this.tokenService.revokeMinterRole(
  //     walletId,
  //     'GMAC',
  //     minterRoleDto
  //   );
  // }

  @Post('mint-tokens')
  async mintTokens(
    @CheckManagedWallet() { walletId },
    @Body() mintTokensDto: MintTokensDto
  ) {
    return await this.tokenService.mintTokens(walletId, 'GMAC', mintTokensDto);
  }


  @Post('transfer')
  async transferTokens(
    @CheckManagedWallet() { walletId },
    @Body() transferData: TransferDto
  ) {
    return await this.tokenService.transfer(walletId, 'GMAC', transferData);
  }
}


// function transferOwnership(address newOwner) public onlyOwner {
//   _grantRole(DEFAULT_ADMIN_ROLE, newOwner);
//   _revokeRole(DEFAULT_ADMIN_ROLE, msg.sender);
// }


// function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
//   require(!_mintingCompleted, "You can't mint any more");

//   uint256 _all = amount + totalSupply();
//   require(_all <= _maxSupply, "Mint exceeds max supply");

//   if (_all == _maxSupply && !_mintingCompleted) _mintingCompleted = true;
//   _mint(to, amount);
// }

// function maxSupply() public pure returns (uint256) {
//   return _maxSupply;
// }

// function granMinterRole(address minter) public onlyRole(DEFAULT_ADMIN_ROLE) {
//   _grantRole(MINTER_ROLE, minter);
//   //TODO should remove previous minter ?
// }