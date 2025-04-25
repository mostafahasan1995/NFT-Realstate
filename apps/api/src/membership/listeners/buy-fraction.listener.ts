// src/events/listeners/buy-fraction.listener.ts
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MembershipService } from '../membership.service';
import { MembershipCashbackRepository } from '../membership-cashback.repository';
import { CashbackStatus } from '../enum/cashback-status.enum';
import { User } from '../../users/schemas/user.schema';
import { Membership } from '../schemas/membership.schema';

@Injectable()
export class BuyFractionListener {
  constructor(
    private readonly membershipCashbackRepository: MembershipCashbackRepository,
    private readonly membershipService: MembershipService
  ) { }



  @OnEvent('buy-fraction')
  async handleBuyFractionEvent(
    {
      user,
      assetId,
      hashAddress,
      quantity,
      unitPrice,
      transactionFees,
    }: {
      user: User,
      fundraisingAddress: string,
      hashAddress: string,
      quantity: number,
      unitPrice: number,
      assetId: string,
      transactionFees: number
    }) {
    let userMembership = user.membership as Membership
    if (!userMembership) {
      const result = await this.membershipService.getUserMembership(user)
      userMembership = result.membership
    }
    const cashback = userMembership?.cashback ?? 0
    await this.membershipCashbackRepository.create({
      buyerId: user?._id,
      assetId,
      hashAddress,
      quantity,
      cashback,
      unitPrice,
      earnedCashback: transactionFees * cashback
    })

    await this.membershipService.updateUserMembership(user)
  }
}
