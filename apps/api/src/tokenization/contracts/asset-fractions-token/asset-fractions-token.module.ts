import { Module } from '@nestjs/common';
import { WalletsModule } from '../../../wallets/wallets.module';
import { AssetFractionsTokenService } from './asset-fractions-token.service';
import { AssetFractionsTokenController } from './asset-fractions-token.controller';
import { EthersProviderModule } from '../../../ethers-provider/ethers-provider.module';
import { UserAssetFractionsTokenController } from './asset-fractions-token.controller.user';
import { AssetModule } from 'apps/api/src/asset/asset.module';

@Module({
  imports: [WalletsModule, EthersProviderModule, AssetModule],
  controllers: [AssetFractionsTokenController, UserAssetFractionsTokenController],
  providers: [AssetFractionsTokenService],
  exports: [AssetFractionsTokenService],
})
export class AssetFractionsTokenModule { }
