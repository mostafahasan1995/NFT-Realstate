import { Module } from '@nestjs/common';
import { EthersProviderService } from './ethers-provider.service';
import { EthersProviderController } from './ethers-provider.controller';

@Module({
  controllers: [EthersProviderController],
  providers: [EthersProviderService],
  exports: [EthersProviderService],
})
export class EthersProviderModule {}
