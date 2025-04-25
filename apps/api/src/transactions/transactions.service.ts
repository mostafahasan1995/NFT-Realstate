import { Injectable } from '@nestjs/common';
import { DepositService } from './deposit/deposit.service';
import { WithdrawService } from './withdraw/withdraw.service';
import { TransactionQueryDto } from './dto/transaction-query.dto';
import { Types } from 'mongoose';


@Injectable()
export class TransactionsService {


  constructor(
    private readonly DepositService: DepositService,
    private readonly WithdrawalService: WithdrawService,

  ) { }

  async findAll({ startDate, endDate }: TransactionQueryDto, userId: string) {
    const [deposits, withdrawals] = await Promise.all([
      this.DepositService.depositRepository.find({ createdAt: { $gte: startDate, $lte: endDate }, userId: new Types.ObjectId(userId) }),
      this.WithdrawalService.withdrawRepository.find({ createdAt: { $gte: startDate, $lte: endDate }, userId: new Types.ObjectId(userId) }),
    ]);

    const [transformedDeposits, transformedWithdrawals] = await Promise.all([
      this.transformTransactions(deposits, 'deposit'),
      this.transformTransactions(withdrawals, 'withdraw')
    ])
    return this.sortTransactions(transformedDeposits, transformedWithdrawals);
  }

  private sortTransactions(deposits, withdrawals) {
    return [...deposits, ...withdrawals].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  private async transformTransactions(transactions, actionType) {
    return transactions.map(transaction => ({ ...transaction.toObject(), action: actionType, userId: '' }));
  }


  async getCurrentBalance(userId: string) {
    const [totalDeposit, totalWithdraw] = await Promise.all([
      this.DepositService.getTotalDeposit(userId),
      this.WithdrawalService.getTotalWithdraw(userId),
    ]);
    return { totalDeposit, totalWithdraw, balance: totalDeposit - totalWithdraw };
  }


}
