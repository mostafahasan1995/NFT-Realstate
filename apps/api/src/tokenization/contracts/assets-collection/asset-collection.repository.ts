import { Injectable } from '@nestjs/common';
import { ContractAssetCollection } from './schemas/contract-asset-collection.schema';
import { BaseRepository } from '../../../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class AssetCollectionRepository extends BaseRepository<ContractAssetCollection> {
  constructor(
    @InjectModel(ContractAssetCollection.name)
    private readonly contractAssetCollectionModel: Model<ContractAssetCollection>
  ) {
    super(contractAssetCollectionModel);
  }
}
