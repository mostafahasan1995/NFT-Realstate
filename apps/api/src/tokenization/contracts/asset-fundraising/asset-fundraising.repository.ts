import { Injectable } from '@nestjs/common';
import { ContractAssetFundraising } from './schemas/contract-asset-fundraising.schema';
import { BaseRepository } from '../../../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AssetFundraisingRepository extends BaseRepository<ContractAssetFundraising> {
  constructor(
    @InjectModel(ContractAssetFundraising.name)
    private readonly contractAssetFundraisingModel: Model<ContractAssetFundraising>
  ) {
    super(contractAssetFundraisingModel);
  }
}
