import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { UsersModule } from '../users/users.module';
import { EthersProviderModule } from '../ethers-provider/ethers-provider.module';
import { KmsModule } from '../aws/kms/kms.module';
import { WalletEthersService } from './wallet-ethers.service';
import { AdminWalletsController } from './wallets.admin.controller';
import { ContractsModule } from '../contracts/contracts.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    KmsModule,
    UsersModule,
    ContractsModule,
    EthersProviderModule,
    CacheModule.register(),
  ],
  controllers: [WalletsController, AdminWalletsController],
  providers: [WalletsService, WalletEthersService],
  exports: [WalletsService],
})
export class WalletsModule {}
