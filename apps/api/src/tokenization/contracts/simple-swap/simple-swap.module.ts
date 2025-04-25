import { Module } from '@nestjs/common';
import { SimpleSwapService } from './simple-swap.service';
import { SimpleSwapController } from './simple-swap.controller';
import { WalletsModule } from '../../../wallets/wallets.module';
import { ContractsModule } from '../../../contracts/contracts.module';

@Module({
  imports: [WalletsModule, ContractsModule],
  controllers: [SimpleSwapController],
  providers: [SimpleSwapService],
})
export class SimpleSwapModule {}
