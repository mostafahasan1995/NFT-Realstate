import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AssetsCollectionService } from './assets-collection.service';
import { WalletsModule } from '../../../wallets/wallets.module';
import {
  ContractAssetCollection,
  ContractAssetCollectionSchema,
} from './schemas/contract-asset-collection.schema';
import { AdminAssetsCollectionController } from './assets-collection.admin.controller';
import { EthersProviderModule } from '../../../ethers-provider/ethers-provider.module';
import { AssetCollectionRepository } from './asset-collection.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ContractAssetCollection.name,
        schema: ContractAssetCollectionSchema,
      },
    ]),
    WalletsModule,
    EthersProviderModule,
  ],
  controllers: [AdminAssetsCollectionController],
  providers: [AssetsCollectionService, AssetCollectionRepository],
  exports: [AssetsCollectionService],
})
export class AssetsCollectionModule {}
