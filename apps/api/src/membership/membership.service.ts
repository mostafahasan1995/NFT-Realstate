import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Membership } from './schemas/membership.schema';
import { MembershipRepository } from './membership.repository';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { UsersService } from '../users/users.service';
import { AddUserToMembershipDto } from './dto/add-user-to-membership.dto';
import { User } from '../users/schemas/user.schema';
import { TokenizationService } from '../tokenization/tokenization.service';
import { WalletType } from '../users/enums/wallet-type.enum';
import { Wallet } from '../wallets/schemas/wallet.schema';
import { UserDataDto } from '../users/dto/user-data.dto';

@Injectable()
export class MembershipService {
  constructor(
    private readonly membershipRepository: MembershipRepository,
    private readonly userService: UsersService,
    private readonly tokenizationService: TokenizationService,

  ) { }

  async create(createMembershipDto: CreateMembershipDto): Promise<Membership> {
    const membership = await this.membershipRepository.create(createMembershipDto);
    this.validateMembership(membership)
    return membership

  }

  async findAll(): Promise<Membership[]> {
    const memberships = await this.membershipRepository.find();
    this.validateMembership(memberships)
    return memberships
  }

  async findById(id: string): Promise<Membership> {
    const membership = await this.membershipRepository.model.findById(id);
    this.validateMembership(membership)

    return membership

  }


  async update(id: string, data: UpdateMembershipDto): Promise<Membership> {
    const membership = await this.membershipRepository.model.findByIdAndUpdate(id, data, { new: true });
    this.validateMembership(membership)

    return membership
  }

  async delete(id: string): Promise<Membership> {
    const membership = await this.membershipRepository.model.findByIdAndDelete(id);
    this.validateMembership(membership)

    return membership
  }

  async addUserToMembership({ userId, membershipId }: AddUserToMembershipDto): Promise<{ message: string }> {
    const membership = await this.membershipRepository.model.findById(membershipId);
    this.validateMembership(membership)

    const user = await this.userService.update(userId, { membership: membership._id });
    if (!user)
      throw new HttpException('User not found', HttpStatus.CREATED)

    return { message: 'User added to membership' }
  }

  private validateMembership(membership: Membership | Membership[]) {
    if (!membership || (Array.isArray(membership) && membership.length === 0))
      throw new HttpException('No data', HttpStatus.CREATED)
    return membership
  }


  async getUserMembership(user: User): Promise<{ membership: Membership, totalPurchases: number }> {
    const wallet = this.getUserWallets(user)
    const totalPurchases = await this.getTotalUserFractions(wallet)
    if (!user.membership)
      await this.checkAndUpdateUserMembershipByTotalPurchases(totalPurchases, user._id)
    return {
      totalPurchases,
      membership: user.membership as Membership
    };
  }

  async updateUserMembership(user: User) {
    const wallet = this.getUserWallets(user)
    const totalPurchases = await this.getTotalUserFractions(wallet)
    await this.checkAndUpdateUserMembershipByTotalPurchases(user._id, totalPurchases)
  }

  async checkAndUpdateUserMembershipByTotalPurchases(totalPurchases: number, userId: string) {
    const membership = await this.getMembershipToAmount(totalPurchases)
    membership ? await this.addUserToMembership({ userId, membershipId: membership._id }) : ""
  }

  getUserWallets(user: User) {
    switch (user.walletType) {
      case WalletType.managed: return (user.managedWallet as Wallet)?.address
      case WalletType.external: return user.wallets
      default:
        throw new HttpException('user have\'nt wallet', 400)
    }
  }

  async getTotalUserFractions(addresses: string | string[]) {
    let fractionsTotalPrice;
    if (Array.isArray(addresses))
      addresses.map(async (address) => {
        fractionsTotalPrice +=
          (await this.tokenizationService.getUserFractionsWithTotalPrice(address)).fractionsTotalPrice
      })
    else fractionsTotalPrice = await this.tokenizationService.getUserFractionsWithTotalPrice(addresses)
    return fractionsTotalPrice
  }

  private async getMembershipToAmount(amount: number) {
    const memberships: Membership[] = await this.findAll();

    if (!memberships || memberships.length === 0) {
      return null;
    }

    let topMembershipLevel = memberships[0];
    for (const membership of memberships) {
      if (membership.maxPurchaseLimit > topMembershipLevel.maxPurchaseLimit)
        topMembershipLevel = membership
      if (amount >= membership.minPurchaseLimit && amount <= membership.maxPurchaseLimit)
        return membership;
    }
    if (amount > topMembershipLevel.maxPurchaseLimit)
      return topMembershipLevel
    return null;
  }
}
