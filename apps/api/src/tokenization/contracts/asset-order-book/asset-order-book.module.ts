import { Module } from '@nestjs/common';
import { AssetOrderBookService } from './asset-order-book.service';
import { AssetOrderBookController } from './asset-order-book.controller';
import { WalletsModule } from '../../../wallets/wallets.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TokenizationOrderBook,
  TokenizationOrderBookSchema,
} from './schemas/order-book.schema';
import { AssetModule } from '../../../asset/asset.module';
import { AdminAssetOrderBookController } from './asset-order-book.admin.controller';
import { ContractsModule } from '../../../contracts/contracts.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TokenizationOrderBook.name,
        schema: TokenizationOrderBookSchema,
      },
    ]),
    WalletsModule,
    AssetModule,
    ContractsModule,
  ],
  controllers: [AssetOrderBookController, AdminAssetOrderBookController],
  providers: [AssetOrderBookService],
  exports: [AssetOrderBookService],
})
export class AssetOrderBookModule {}
