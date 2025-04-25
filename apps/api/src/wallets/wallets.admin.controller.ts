import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  BadRequestException,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guard/roles.guard';
import { WalletsService } from './wallets.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { WalletAddressDto } from './dto/wallet-address.dto';
import { WalletDto } from './dto/wallet.dto';
import { QueryWalletByUserDto } from './dto/query-wallet-by-user.dto';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/wallets')
@Controller('admin/wallets')
@UseInterceptors(ClassSerializerInterceptor)
export class AdminWalletsController {
  constructor(private readonly walletsService: WalletsService) { }

  @Get()
  async findAll() {
    const wallets = await this.walletsService.findAll();

    const serializedWallets = wallets.map((wallet) => new WalletDto(wallet));
    return serializedWallets;
  }

  // @Get('user')
  // async getWalletByUserInfo(@Query() queryWalletByUserDto: QueryWalletByUserDto) {
  //   const wallet = await this.walletsService.findWalletByUserInfo(queryWalletByUserDto)
  //   if (Array.isArray(wallet))
  //     return { wallet: wallet }
  //   return { wallet: new WalletDto(wallet) }
  // }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wallet = await this.walletsService.findById(id);
    if (!wallet) {
      throw new BadRequestException('Wallet with the given id is not found');
    }

    const serializedWallet = new WalletDto(wallet);
    return serializedWallet;
  }

  @Post('charge-wallet-matic')
  async chargeWalletWithMatic(@Body() { walletAddress }: WalletAddressDto) {
    const hash = await this.walletsService.chargeWalletWithGas(walletAddress);
    return { hash };
  }

}
