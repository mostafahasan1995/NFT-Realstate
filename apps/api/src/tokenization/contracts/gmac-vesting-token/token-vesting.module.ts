import { Module } from '@nestjs/common';
import { TokenVestingService } from './token-vesting.service';
import { TokenVestingAdminController } from './token-vesting.admin.controller';
import { WalletsModule } from 'apps/api/src/wallets/wallets.module';

@Module({
  imports: [WalletsModule],
  controllers: [TokenVestingAdminController],
  providers: [TokenVestingService],
  exports: [TokenVestingService]
})
export class TokenVestingModule { }
