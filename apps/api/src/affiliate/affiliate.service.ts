import { FilterQuery } from 'mongoose';
import { HttpException, Injectable, Query } from '@nestjs/common';
import { Affiliate } from './schemas/affiliate.schema';
import { UsersService } from '../users/users.service';
import { IAffiliate } from './interfaces/affiliate.interface';
import { AffiliateStatus } from './enums/affiliate-status.enum';
import { AffiliateRepository } from './affiliate.repository';

@Injectable()
export class AffiliateService {
  constructor(
    private readonly affiliateRepository: AffiliateRepository,
    private readonly usersService: UsersService,
  ) { }

  async findAll() {
    return await this.affiliateRepository.find();
  }



  async findOne(filterData: Partial<Affiliate>): Promise<Affiliate> {
    return this.affiliateRepository.findOne(filterData as FilterQuery<Affiliate>);
  }

  async createCommission(createData: IAffiliate): Promise<Affiliate> {
    return await this.affiliateRepository.create(createData);
  }

  async confirmCommissionsByFundraisingAddress(fundraisingAddress: string): Promise<void> {
    await this.affiliateRepository.model.updateMany(
      {
        fundraisingAddress,
      },
      {
        status: AffiliateStatus.Confirmed,
      }
    );
  }

  async getCommissionsByReferralCodeAndStatus(query: { referrerCode: string, status: string, cashbackGranted?: boolean }): Promise<number> {
    const commissions = await this.affiliateRepository.find({
      ...query
    });
    return commissions.reduce((acc, commission) => acc + commission.commission, 0);
  }

  async findAllReferredUsers(referralCode: string) {
    return await this.usersService.findReferredUsersByReferralCode(referralCode);
  }

  calculateCommission(transactionFees: number): number {
    const commissionRatePercentage = 0.5;

    const commission = transactionFees * commissionRatePercentage;
    return commission;
  }

  calculateBuyFees(unitPrice: number, quantity: number, transactionFeeRate: number): number {
    const transactionTotal = unitPrice * quantity;
    const transactionFees = (transactionTotal * transactionFeeRate) / 100;
    return transactionFees;
  }

  async checkIfInvitationCashbackGranted(userId: string, referrerCode: string) {
    const commissions = await this.affiliateRepository.findOne({ userId, referrerCode, cashbackGranted: true })
    if (commissions) return true
    return false
  }
}
