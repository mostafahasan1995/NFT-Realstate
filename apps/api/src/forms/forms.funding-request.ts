import { Injectable } from '@nestjs/common';
import { Form } from './schemas/form.schema';
import { BaseRepository } from '../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FundingRequests } from './schemas/funding-requests.form.schema';

@Injectable()
export class FundingRequestsRepository extends BaseRepository<FundingRequests> {
  constructor(
    @InjectModel(FundingRequests.name)
    private readonly FundingRequestsModel: Model<FundingRequests>
  ) {
    super(FundingRequestsModel);
  }
}
