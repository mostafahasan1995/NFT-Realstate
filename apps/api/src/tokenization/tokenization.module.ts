import { forwardRef, Module } from '@nestjs/common';
import { TokenizationService } from './tokenization.service';
import { TokenizationController } from './tokenization.controller';
import { WalletsModule } from '../wallets/wallets.module';
import { AssetFractionsTokenModule } from './contracts/asset-fractions-token/asset-fractions-token.module';
import { AssetFundraisingModule } from './contracts/asset-fundraising/asset-fundraising.module';
import { AssetsCollectionModule } from './contracts/assets-collection/assets-collection.module';
import { AssetModule } from '../asset/asset.module';
import { AssetOrderBookModule } from './contracts/asset-order-book/asset-order-book.module';
import { UsersModule } from '../users/users.module';
import { FractionalCenterModule } from './contracts/fractional-center/fractional-center.module';
import { AdminTokenizationController } from './tokenization.admin.controller';
import { ContractsModule } from '../contracts/contracts.module';
import { TokenVestingModule } from './contracts/gmac-vesting-token/token-vesting.module';

@Module({
  imports: [
    UsersModule,
    WalletsModule,
    AssetModule,
    AssetsCollectionModule,
    AssetFractionsTokenModule,
    FractionalCenterModule,
    forwardRef(() => AssetFundraisingModule),
    AssetOrderBookModule,
    ContractsModule,
    TokenVestingModule
  ],
  controllers: [TokenizationController, AdminTokenizationController],
  providers: [TokenizationService],
  exports: [TokenizationService],
})
export class TokenizationModule { }
