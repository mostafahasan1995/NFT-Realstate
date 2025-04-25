import { Module } from '@nestjs/common';
import { FractionalCenterService } from './fractional-center.service';
import { FractionalCenterController } from './fractional-center.controller';
import { WalletsModule } from '../../../wallets/wallets.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  TokenizationFractionalCenter,
  TokenizationFractionalCenterSchema,
} from './schemas/fractional-center.schema';
import { AdminFractionalCenterController } from './fractional-center.admin.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TokenizationFractionalCenter.name,
        schema: TokenizationFractionalCenterSchema,
      },
    ]),
    WalletsModule,
  ],
  controllers: [FractionalCenterController, AdminFractionalCenterController],
  providers: [FractionalCenterService],
  exports: [FractionalCenterService],
})
export class FractionalCenterModule {}
