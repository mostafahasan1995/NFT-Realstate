import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionController } from './transaction.controller';
import { DepositModule } from './deposit/deposit.module';
import { WithdrawModule } from './withdraw/withdraw.module';

@Module({
  imports: [DepositModule, WithdrawModule],
  providers: [TransactionsService],
  controllers: [TransactionController],
})
export class TransactionModule { }
