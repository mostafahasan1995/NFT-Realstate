import {
  Controller,
  Get,
  Post,
  Delete,
  Request,
  BadRequestException,
  Body,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { ExternalWalletDto } from './dto/external-wallet.dto';
import { CreateExternalWalletDto } from './dto/create-external-wallet.dto';
import { CheckManagedWallet } from './decorators/check-managed-wallet.decorator';
import { WalletAddressDto } from './dto/wallet-address.dto';
import { BalanceDto } from './dto/balance.dto';
import { WalletDto } from './dto/wallet.dto';

@ApiBearerAuth()
@ApiTags('wallets')
@Controller('wallets')
@UseInterceptors(ClassSerializerInterceptor)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get()
  @ApiOperation({
    summary: 'GET the user wallet belonging to the authentication token',
  })
  async getWallet(@CheckManagedWallet() { walletId }) {
    const wallet = await this.walletsService.findById(walletId);

    return new WalletDto(wallet);
  }

  @Post('create/managed')
  @ApiOperation({
    summary:
      'Create a managed wallet for the user belonging to the authentication token',
  })
  async createManagedWallet(@Request() { user }) {
    const userId = user._id;
    const wallet = await this.walletsService.createManagedWallet(userId);

    return new WalletDto(wallet);
  }

  @Post('create/external')
  @ApiOperation({
    summary:
      'Create an external wallet for the user belonging to the authentication token',
  })
  async createExternalWallet(
    @Request() { user },
    @Body() { address }: CreateExternalWalletDto
  ): Promise<ExternalWalletDto> {
    const userId = user._id;
    const wallets = await this.walletsService.createExternalWallet(
      userId,
      address
    );
    return { wallets };
  }

  @Post('connect/external')
  async connectExternalWallet(
    @Request() { user },
    @Body() { address }: CreateExternalWalletDto
  ): Promise<ExternalWalletDto> {
    const userId = user._id;
    const wallets = await this.walletsService.connectExternalWallet(
      userId,
      address
    );
    return { wallets };
  }

  @Post('balance')
  async getBalanceByTokenAddress(@Body() balanceDto: BalanceDto) {
    const balance = await this.walletsService.getBalanceByTokenAddress(
      balanceDto
    );
    return { balance };
  }

  @Post('balance-eth')
  async getEthBalance(@Body() { walletAddress }: WalletAddressDto) {
    return await this.walletsService.getEthBalance(walletAddress);
  }

  @Post('balances')
  async getBalancesByWalletAddress(
    @Body() { walletAddress }: WalletAddressDto
  ) {
    return await this.walletsService.getTokenBalances(walletAddress);
  }

  @Get('charge-wallet')
  @ApiOperation({ summary: 'GET send request to charge wallet' })
  async chargeWallet(@Request() { user }) {
    const { name, email } = user;
    return this.walletsService.chargeWalletRequest(name, email);
  }

  @Delete()
  @ApiOperation({
    summary:
      'Archive wallet for the user belonging to the authentication token',
  })
  async archive(@CheckManagedWallet() { walletId }) {
    const wallet = await this.walletsService.archiveWallet(walletId);
    if (!wallet) {
      throw new BadRequestException('Wallet with the given id is not found');
    }

    return new WalletDto(wallet);
  }
}
