import { Injectable } from '@nestjs/common';
import { Affiliate } from './schemas/affiliate.schema';
import { BaseRepository } from '../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AffiliateStatus } from './enums/affiliate-status.enum';

@Injectable()
export class AffiliateRepository extends BaseRepository<Affiliate> {
  constructor(
    @InjectModel(Affiliate.name)
    private readonly affiliateModel: Model<Affiliate>
  ) {
    super(affiliateModel);
  }

  async getCommissionGroupByUserForStatus(status: string) {
    const data = await this.affiliateModel.aggregate([
      {
        $match: {
          status: status,
          cashbackGranted: false
        },
      },
      {
        $group: {
          _id: '$referrerCode',
          totalCommission: { $sum: '$commission' },
          totalQuantity: { $sum: '$quantity' },
          totalUnitPrice: { $sum: '$unitPrice' },
          records: { $push: '$$ROOT' },
        },
      },
      {
        $project: {
          referrerCode: '$_id',
          totalCommission: 1,
          totalQuantity: 1,
          totalUnitPrice: 1,
          _id: 0,
          records: 1,
        },
      },
    ]);

    return data;
  }


}
