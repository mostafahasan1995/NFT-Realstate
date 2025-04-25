import { Module } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { AffiliateController } from './affiliate.controller';
import { UsersModule } from '../users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Affiliate, AffiliateSchema } from './schemas/affiliate.schema';
import { AdminAffiliateController } from './affiliate.admin.controller';
import { AffiliateRepository } from './affiliate.repository';
import { MembershipModule } from '../membership/membership.module';
import { GiftsService } from './gifts.service';
import { TokensModule } from '../tokenization/contracts/tokens/tokens.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Affiliate.name, schema: AffiliateSchema },
    ]),
    UsersModule,
    MembershipModule,
    TokensModule
  ],
  controllers: [AffiliateController, AdminAffiliateController],
  providers: [AffiliateService, AffiliateRepository, GiftsService],
  exports: [AffiliateService],
})
export class AffiliateModule { }
