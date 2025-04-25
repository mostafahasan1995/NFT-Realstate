import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetController } from './asset.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Asset, AssetSchema } from './schemas/asset.schema';
import { AdminAssetController } from './asset.admin.controller';
import { AssetRepository } from './asset.repository';
import { ContractsModule } from '../contracts/contracts.module';
import { TimelineModule } from './timeline/timeline.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Asset.name, schema: AssetSchema }]),
    ContractsModule,
    TimelineModule
  ],
  controllers: [AssetController, AdminAssetController],
  providers: [AssetService, AssetRepository],
  exports: [AssetService],
})
export class AssetModule { }
