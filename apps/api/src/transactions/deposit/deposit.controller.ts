import {Body, Controller, Get, Post, Request} from '@nestjs/common';
import {DepositService} from './deposit.service';
import {ApiTags} from '@nestjs/swagger';
import {DepositBankTransferDto} from './dto/deposit-bank-transfer.dto';

@ApiTags('deposits')
@Controller('deposits')
export class DepositController {
  constructor(private readonly depositService: DepositService) {}

  @Get()
  async getUserDeposits(@Request() {user}) {
    return await this.depositService.findByUserId(user._id);
  }

  @Post('bank-transfer')
  async postDepositBankTransfer(
    @Request() {user},
    @Body() depositBankTransferDto: DepositBankTransferDto
  ) {
    return await this.depositService.depositBankTransfer(
      user._id,
      depositBankTransferDto
    );
  }
}
