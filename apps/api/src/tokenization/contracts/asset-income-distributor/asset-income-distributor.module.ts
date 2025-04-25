import { Module } from '@nestjs/common';
import { AssetIncomeDistributorService } from './asset-income-distributor.service';
import { AssetIncomeDistributorController } from './asset-income-distributor.controller';
import { WalletsModule } from '../../../wallets/wallets.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TokenizationIncomeDistributor,
  TokenizationIncomeDistributorSchema,
} from './schemas/income-distributor.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TokenizationIncomeDistributor.name,
        schema: TokenizationIncomeDistributorSchema,
      },
    ]),
    WalletsModule,
  ],
  controllers: [AssetIncomeDistributorController],
  providers: [AssetIncomeDistributorService],
  exports: [AssetIncomeDistributorService],
})
export class AssetIncomeDistributorModule {}
