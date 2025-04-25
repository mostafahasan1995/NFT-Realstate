import { Controller, Get, Request } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AffiliateStatus } from './enums/affiliate-status.enum';
import { GiftsService } from './gifts.service';

@ApiBearerAuth()
@ApiTags('affiliate')
@Controller('affiliate')
export class AffiliateController {
  constructor(
    private readonly affiliateService: AffiliateService,
    private readonly giftsService: GiftsService,
  ) { }

  @Get()
  findAllReferredUsers(@Request() { user }) {
    const referralCode = user.referralCode;
    return this.affiliateService.findAllReferredUsers(referralCode);
  }

  @Get('gifts')
  async findAllUserGifts(@Request() { user }) {
    return await this.giftsService.findAllUserGifts(user);
  }

  @Get('commissions')
  async getAllTotalCommissions(@Request() { user }) {
    const referralCode = user.referralCode;

    // Get confirmed commissions
    const confirmedCommissions =
      await this.affiliateService.getCommissionsByReferralCodeAndStatus(
        {
          referrerCode: referralCode,
          status: AffiliateStatus.Confirmed
        }
      );

    // Get pending commissions
    const pendingCommissions =
      await this.affiliateService.getCommissionsByReferralCodeAndStatus(
        {
          referrerCode: referralCode,
          status: AffiliateStatus.Pending
        }
      );

    return {
      commissions: {
        confirmedCommission: confirmedCommissions,
        pendingCommission: pendingCommissions,
      },
    };
  }

  @Get('request')
  requestGifts(@Request() { user }) {
    return this.giftsService.requestGifts(user);
  }


}
