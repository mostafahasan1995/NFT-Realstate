import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MembershipCashback } from './schemas/membership-cashback.schema';
import { CashbackStatus } from './enum/cashback-status.enum';

@Injectable()
export class MembershipCashbackRepository extends BaseRepository<MembershipCashback> {
  constructor(
    @InjectModel(MembershipCashback.name)
    private readonly membershipCashbackModel: Model<MembershipCashback>) {
    super(membershipCashbackModel);
  }


  async getEarnedCashbackByUserIdAndStatus(userId: string, status: CashbackStatus): Promise<number> {
    const membershipCashback = await this.membershipCashbackModel.find({
      status: status,
      buyerId: userId,
    });

    return membershipCashback.reduce(
      (acc, item) => acc + item.earnedCashback,
      0
    );
  }

  async getTotalEarnedCashbackGroupByUserForStatus(status: CashbackStatus) {
    const data = await this.membershipCashbackModel.aggregate([
      {
        $match: {
          status: status,
        },
      },
      {
        $group: {
          _id: '$buyerId',
          totalEarnedCashback: { $sum: '$earnedCashback' },
          totalQuantity: { $sum: '$quantity' },
          totalUnitPrice: { $sum: '$unitPrice' },
          records: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          buyerId: '$_id',
          totalEarnedCashback: 1,
          totalQuantity: 1,
          totalUnitPrice: 1,
          records: 1,
          _id: 0,
        },
      },
    ]);
    return data
  }


}
