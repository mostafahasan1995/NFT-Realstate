import { Module } from '@nestjs/common';
import { TokensService } from './tokens.service';
import { TokensController } from './tokens.controller';
import { EthersProviderModule } from '../../../ethers-provider/ethers-provider.module';
import { WalletsModule } from '../../../wallets/wallets.module';
import { GusdController } from './gusd/gusd.controller';
import { UsdtController } from './usdt/usdt.controller';
import { ContractsModule } from '../../../contracts/contracts.module';
import { GusdAdminController } from './gusd/gusd.admin.controller';
import { GUSDService } from './gusd/gusd.service';
import { GMACAdminController } from './gmac/gmac.admin.controller';
import { GMACController } from './gmac/gmac.controller';
import { GMACService } from './gmac/gmac.service';

@Module({
  imports: [EthersProviderModule, WalletsModule, ContractsModule],
  controllers: [
    TokensController,
    GusdController,
    GusdAdminController,
    UsdtController,
    GMACController,
    GMACAdminController,
  ],
  providers: [TokensService, GUSDService, GMACService],
  exports: [TokensService],
})
export class TokensModule { }
