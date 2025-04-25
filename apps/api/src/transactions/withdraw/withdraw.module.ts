import { Module } from '@nestjs/common';
import { WithdrawService } from './withdraw.service';
import { WithdrawController } from './withdraw.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Withdraw, WithdrawSchema } from './schemas/withdraw.schema';
import { AdminWithdrawController } from './withdraw.admin.controller';
import { WithdrawRepository } from './withdraw.repository';
import { TokensModule } from '../../tokenization/contracts/tokens/tokens.module';
import { S3Module } from '../../aws/s3/s3.module';
import { OtpModule } from '../../otp/otp.module';
import { WalletsModule } from '../../wallets/wallets.module';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: Withdraw.name, schema: WithdrawSchema },
    ]),
    TokensModule,
    S3Module,
    OtpModule,
    WalletsModule,
  ],
  controllers: [WithdrawController, AdminWithdrawController],
  providers: [WithdrawService, WithdrawRepository],
  exports: [WithdrawService]
})
export class WithdrawModule { }
