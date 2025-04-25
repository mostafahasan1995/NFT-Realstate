import { FilterQuery } from 'mongoose';
import { HttpException, Injectable, Query } from '@nestjs/common';
import { Affiliate } from './schemas/affiliate.schema';
import { UsersService } from '../users/users.service';
import { IAffiliate } from './interfaces/affiliate.interface';
import { AffiliateStatus } from './enums/affiliate-status.enum';
import { AffiliateRepository } from './affiliate.repository';
import { UserDataDto } from '../users/dto/user-data.dto';
import { MembershipCashbackRepository } from '../membership/membership-cashback.repository';
import { CashbackStatus } from '../membership/enum/cashback-status.enum';
import { HttpStatusCode } from 'axios';
import { AffiliateService } from './affiliate.service';
import { TokensService } from '../tokenization/contracts/tokens/tokens.service';
import { User } from '../users/schemas/user.schema';

@Injectable()
export class GiftsService {
  constructor(
    private readonly affiliateRepository: AffiliateRepository,
    private readonly affiliateService: AffiliateService,
    private readonly usersService: UsersService,
    private readonly membershipCashbackRepository: MembershipCashbackRepository,
    private readonly tokensService: TokensService
  ) { }


  async findRequestedGifts() {
    const requestedMembershipCashback = await this.membershipCashbackRepository.getTotalEarnedCashbackGroupByUserForStatus(CashbackStatus.Requested);
    const requestedAffiliate = await this.affiliateRepository.getCommissionGroupByUserForStatus(AffiliateStatus.Requested);
    return {
      requestedMembershipCashback,
      requestedAffiliate
    }
  }

  async findAllUserGifts(user: UserDataDto) {
    const invitationsGifts = await this.affiliateRepository.find({ referrerCode: user.referralCode, status: AffiliateStatus.Pending, cashbackGranted: false });
    const membershipGifts = await this.membershipCashbackRepository.find({ buyerId: user._id, status: CashbackStatus.Pending });
    return {
      invitationsGifts: invitationsGifts.reduce((acc, commission) => acc + commission.commission, 0),
      membershipGifts: membershipGifts.reduce((acc, cashback) => acc + cashback.earnedCashback, 0)
    }
  }

  async requestGifts(user: UserDataDto) {
    const MINIMUM_CASHBACK = 500;
    const invitationsCashback = await this.affiliateService.getCommissionsByReferralCodeAndStatus({ referrerCode: user.referralCode, status: AffiliateStatus.Pending, cashbackGranted: false });
    const MembershipCashback = await this.membershipCashbackRepository.getEarnedCashbackByUserIdAndStatus(user._id, CashbackStatus.Pending);

    if (invitationsCashback + MembershipCashback >= MINIMUM_CASHBACK) {
      await this.affiliateRepository.model.updateMany({ status: AffiliateStatus.Pending, referrerCode: user.referralCode, cashbackGranted: false }, { status: AffiliateStatus.Requested });
      await this.membershipCashbackRepository.model.updateMany({ status: CashbackStatus.Pending, buyerId: user._id }, { status: CashbackStatus.Requested });
      return { message: 'Commission Requested' };
    }
    return { message: 'the commission less then 500' };
  }

  async confirmGifts({ userId, referrerCode }, walletId) {
    if (!userId && !referrerCode)
      throw new HttpException('Send userId or referrerCode', HttpStatusCode.BadRequest);

    if (userId) {
      const user = await this.validateAndGetUser({ _id: userId })
      await this.confirmMembershipGifts(user, walletId)
    }

    if (referrerCode) {
      const user = await this.validateAndGetUser({ referralCode: referrerCode })
      await this.confirmAffiliateGifts(user, walletId)
    }
    return { message: 'confirmed' };
  }

  async validateAndGetUser(query: { _id?: string, referralCode?: string }) {
    const user = await this.usersService.findOne(query);
    if (!user) throw new HttpException('the user not found', HttpStatusCode.NotFound);
    return user
  }

  async confirmMembershipGifts(user: User, walletId) {
    const earnedCashback = await this.membershipCashbackRepository.getEarnedCashbackByUserIdAndStatus(user._id, CashbackStatus.Requested)
    await this.transferGift(walletId, user, earnedCashback)
    await this.membershipCashbackRepository.model.updateMany({ status: CashbackStatus.Requested, buyerId: user._id }, { status: CashbackStatus.Confirmed });

  }

  async confirmAffiliateGifts(user: User, walletId) {
    const earnedCashback = await this.affiliateService.getCommissionsByReferralCodeAndStatus({ referrerCode: user.referralCode, status: AffiliateStatus.Requested })
    await this.transferGift(walletId, user, earnedCashback)
    await this.affiliateRepository.model.updateMany({ referrerCode: user.referralCode, status: AffiliateStatus.Requested, cashbackGranted: false }, { status: AffiliateStatus.Confirmed, cashbackGranted: true });
  }

  async transferGift(walletId, user, amount) {
    const wallet = this.usersService.getUserWallet(user)
    const walletAddress = Array.isArray(wallet) ? wallet[0] : wallet.address
    await this.tokensService.mintTokens(walletId, 'GUSD', { walletAddress, amount })
  }

}
