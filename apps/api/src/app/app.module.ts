import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import autopopulate from 'mongoose-autopopulate';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AssetModule } from '../asset/asset.module';
import { MultiplayerModule } from '../multiplayer/multiplayer.module';
import { FileModule } from '../file/file.module';
import { WalletsModule } from '../wallets/wallets.module';
import { AssetsCollectionModule } from '../tokenization/contracts/assets-collection/assets-collection.module';
import { AssetFractionsTokenModule } from '../tokenization/contracts/asset-fractions-token/asset-fractions-token.module';
import { AssetFundraisingModule } from '../tokenization/contracts/asset-fundraising/asset-fundraising.module';
import { TokensModule } from '../tokenization/contracts/tokens/tokens.module';
import { TokenizationModule } from '../tokenization/tokenization.module';
import { ReportsModule } from '../reports/reports.module';
import { EmailModule } from '../email/email.module';
import { FractionalCenterModule } from '../tokenization/contracts/fractional-center/fractional-center.module';
import { AssetOrderBookModule } from '../tokenization/contracts/asset-order-book/asset-order-book.module';
import { EthersProviderModule } from '../ethers-provider/ethers-provider.module';
import { AffiliateModule } from '../affiliate/affiliate.module';
import { StreamsModule } from '../streams/streams.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { WithdrawModule } from '../transactions/withdraw/withdraw.module';
import { SimpleSwapModule } from '../tokenization/contracts/simple-swap/simple-swap.module';
import { EventsModule } from '../events/events.module';
import { SentryModule } from '../sentry/sentry.module';
import { validationSchema } from '../config/env.validation';
import { DepositModule } from '../transactions/deposit/deposit.module';
import { OtpModule } from '../otp/otp.module';
import { FormsModule } from '../forms/forms.module';
import { Bitrix24Module } from '../bitrix24/bitrix24.module';
import { TransactionModule } from '../transactions/transaction.module';
import { MembershipModule } from '../membership/membership.module';
import { TimelineModule } from '../asset/timeline/timeline.module';
import { EmailSubscribersModule } from '../email-subscribers/email-subscribers.module';
import { KycProviderModule } from '../providers/kyc/kyc-provider.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: validationSchema,
    }),
    SentryModule.forRoot(process.env.SENTRY_DSN),
    MongooseModule.forRoot(process.env.MONGO_URI, {
      connectionFactory: (connection) => {
        connection.plugin(autopopulate);
        return connection;
      },
    }),
    EventEmitterModule.forRoot(),
    AuthModule,
    UsersModule,
    AffiliateModule,
    EmailModule,
    AssetModule,
    FileModule,
    MultiplayerModule,
    ReportsModule,
    WalletsModule,
    EthersProviderModule,
    TokenizationModule,
    AssetsCollectionModule,
    AssetFundraisingModule,
    AssetFractionsTokenModule,
    TokensModule,
    FractionalCenterModule,
    AssetOrderBookModule,
    StreamsModule,
    WithdrawModule,
    DepositModule,
    SimpleSwapModule,
    EventsModule,
    OtpModule,
    FormsModule,
    Bitrix24Module,
    TransactionModule,
    MembershipModule,
    TimelineModule,
    EmailSubscribersModule,
    KycProviderModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
