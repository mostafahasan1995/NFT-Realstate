import { Module } from '@nestjs/common';
import { MembershipAdminController } from './membership.admin.controller';
import { MembershipService } from './membership.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Membership, MembershipSchema } from './schemas/membership.schema';
import { MembershipRepository } from './membership.repository';
import { MembershipController } from './membership.controller';
import { UsersModule } from '../users/users.module';
import { TokenizationModule } from '../tokenization/tokenization.module';
import { MembershipCashback, MembershipCashbackSchema } from './schemas/membership-cashback.schema';
import { MembershipCashbackRepository } from './membership-cashback.repository';
import { BuyFractionListener } from './listeners/buy-fraction.listener';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Membership.name, schema: MembershipSchema }]),
    MongooseModule.forFeature([{ name: MembershipCashback.name, schema: MembershipCashbackSchema }]),
    UsersModule,
    TokenizationModule,
  ],
  controllers: [MembershipController, MembershipAdminController],
  providers: [MembershipService, MembershipRepository, MembershipCashbackRepository, BuyFractionListener],
  exports: [MembershipCashbackRepository]
})
export class MembershipModule { }
