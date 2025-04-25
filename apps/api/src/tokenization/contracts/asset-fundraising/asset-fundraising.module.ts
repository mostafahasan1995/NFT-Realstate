import { Module } from '@nestjs/common';
import { AssetFundraisingService } from './asset-fundraising.service';
import { WalletsModule } from '../../../wallets/wallets.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  ContractAssetFundraising,
  ContractAssetFundraisingSchema,
} from './schemas/contract-asset-fundraising.schema';
import { AssetFundraisingController } from './asset-fundraising.controller';
import { EthersProviderModule } from '../../../ethers-provider/ethers-provider.module';
import { AssetModule } from '../../../asset/asset.module';
import { AffiliateModule } from '../../../affiliate/affiliate.module';
import { AdminAssetFundraisingController } from './asset-fundraising.admin.controller';
import { AssetFundraisingRepository } from './asset-fundraising.repository';
import { ContractsModule } from '../../../contracts/contracts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: ContractAssetFundraising.name,
        schema: ContractAssetFundraisingSchema,
      },
    ]),
    ContractsModule,
    WalletsModule,
    EthersProviderModule,
    AssetModule,
    AffiliateModule,
  ],
  controllers: [AssetFundraisingController, AdminAssetFundraisingController],
  providers: [
    AssetFundraisingService,
    AssetFundraisingRepository,

  ],
  exports: [AssetFundraisingService],
})
export class AssetFundraisingModule { }
