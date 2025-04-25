import { Controller, Post, Body, Get, Request } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { CheckManagedWallet } from '../../wallets/decorators/check-managed-wallet.decorator';
import { TransferTokenDto } from './dto/transfer-token.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WithdrawCashDto } from './dto/withdraw-cash.dto';
import { WithdrawCashMangedWalletDto } from './dto/withdraw-cash-managed-wallet.dto';

@ApiBearerAuth()
@ApiTags('withdraws')
@Controller('withdraws')
export class WithdrawController {
  constructor(private readonly withdrawService: WithdrawService) {}

  @Get()
  async getAll(@Request() { user }) {
    return await this.withdrawService.findByUserId(user._id);
  }

  @Post('cash')
  async withdrawCashManagedWallet(
    @Request() { user },
    @CheckManagedWallet() { walletId },
    @Body()
    withdrawCashMangedWalletDto: WithdrawCashMangedWalletDto
  ) {
    return await this.withdrawService.withdrawCashManagedWallet(
      user._id,
      walletId,
      withdrawCashMangedWalletDto
    );
  }

  @Post('cash-external')
  async withdrawCash(
    @Request() { user },
    @Body() withdrawCashDto: WithdrawCashDto
  ) {
    return await this.withdrawService.withdrawCash(user._id, withdrawCashDto);
  }

  @Post('usdt')
  async transferUsdt(
    @Request() { user },
    @CheckManagedWallet() { walletId },
    @Body() transferTokenDto: TransferTokenDto
  ) {
    const hash = await this.withdrawService.withdrawUsdt(
      walletId,
      user.email,
      transferTokenDto
    );
    return {
      hash,
    };
  }

  @Post('gmac')
  async transferGmac(
    @Request() { user },
    @CheckManagedWallet() { walletId },
    @Body() transferTokenDto: TransferTokenDto
  ) {
    const hash = await this.withdrawService.withdrawGmac(
      walletId,
      user.email,
      transferTokenDto
    );
    return {
      hash,
    };
  }

  @Post('send-otp')
  async sendOtp(@Request() { user }) {
    await this.withdrawService.sendWithdrawOtp(user.email);
    return { message: 'OTP send successfully' };
  }
}
