import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsAdminController } from './reports.admin.controller';
import { UsersModule } from '../users/users.module';
import { EmailModule } from '../email/email.module';
import { AffiliateModule } from '../affiliate/affiliate.module';
import { FormsModule } from '../forms/forms.module';
import { DepositModule } from '../transactions/deposit/deposit.module';
import { WithdrawModule } from '../transactions/withdraw/withdraw.module';
import { EmailSesModule } from '../aws/ses/email-ses.module';
import { ContractsModule } from '../contracts/contracts.module';
import { AssetModule } from '../asset/asset.module';
import { EmailSubscribersModule } from '../email-subscribers/email-subscribers.module';

@Module({
  imports: [UsersModule,
    EmailModule,
    EmailSesModule,
    AffiliateModule,
    FormsModule,
    DepositModule,
    WithdrawModule,
    ContractsModule,
    AssetModule,
    EmailSubscribersModule
  ],
  controllers: [ReportsAdminController],
  providers: [ReportsService],
})
export class ReportsModule { }
