import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { User } from './schemas/user.schema';
import { FilterQueryDto } from './dto/filter-query.dto';
import { WalletType } from './enums/wallet-type.enum';
import { UserDataDto } from './dto/user-data.dto';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';
import { UserRepository } from './users.repository';
import { Bitrix24Service } from '../bitrix24/bitrix24.service';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { ExternalUserData } from './interfaces/external-user-data.interface';
import { ThirdPartyProvider } from './interfaces/third-party-provider.interface';
import { LeadData } from '../bitrix24/interfaces/lead-data.interface';
import { FileService } from '../file/file.service';
import { Wallet } from '../wallets/schemas/wallet.schema';
import { UpdateUserPermissionsDto } from './dto/update-permission.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { KycStatus } from './enums/kyc-status';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly bitrix24Service: Bitrix24Service,
    private readonly fileService: FileService
  ) { }

  async create(userDataDto: UserDataDto): Promise<User> {
    const { email, password } = userDataDto;
    const existingUser = await this.userRepository.findOne({ email });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Generate verification code
    const code = Math.floor(100000 + Math.random() * 900000);

    // Generate referral code
    const referralCode = await this.generateReferralCode();

    // Check if referrer code exists
    const referrerCodeExists = userDataDto?.referrerCode ? await this.isReferrerCodeExists(userDataDto.referrerCode) : false;
    const referrerCode = referrerCodeExists ? userDataDto?.referrerCode : null;

    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.userRepository.create({
      ...userDataDto,
      password: hashedPassword,
      verificationCode: `${code}`,
      referralCode,
      referrerCode,
    });
  }

  async createWithThirdPartyProvider(externalUserData: ExternalUserData): Promise<User> {
    const isUserExist = await this.userRepository.findOne({
      email: externalUserData.email,
    });

    if (isUserExist) {
      throw new ConflictException('Email already in use');
    }

    // Generate referral code
    const referralCode = await this.generateReferralCode();

    // Check if referrer code exists
    const referrerCodeExists = externalUserData?.referrerCode ? await this.isReferrerCodeExists(externalUserData.referrerCode) : false;
    const referrerCode = referrerCodeExists ? externalUserData?.referrerCode : null;

    const user = await this.userRepository.create({
      ...externalUserData,
      referralCode,
      referrerCode,
    });

    // Verify user if registration is done with third party provider
    return await this.verifyEmailById(user._id);
  }

  async findOne(userDataDto: UserDataDto): Promise<User> {
    return this.userRepository.findOne(userDataDto);
  }

  async findUserByThirdPartyProviderNameAndId(providerName: string, providerId: string): Promise<User> {
    const query = {
      'thirdPartyProviders.provider_name': providerName,
      'thirdPartyProviders.provider_id': providerId,
    };

    return await this.userRepository.findOne(query);
  }

  async findAll(paginationQueryDto: PaginationQueryDto, filterQueryDto: FilterQueryDto) {
    const { roles, isVerified, interested, search } = filterQueryDto;

    return this.userRepository.findWithPagination(
      paginationQueryDto,
      {
        roles,
        isVerified,
        interested,
      },
      {
        name: search,
        username: search,
        email: search,
      }
    );
  }

  async findUserByWalletAddress({ address }) {
    return await this.userRepository.model.aggregate([
      {
        $lookup: {
          from: 'wallets',
          localField: 'managedWallet',
          foreignField: '_id',
          as: 'managedWallet',
        },
      },
      { $unwind: { path: '$managedWallet', preserveNullAndEmptyArrays: true } },
      { $match: { $or: [{ wallets: address }, { 'managedWallet.address': address }] } },
    ]);
  }

  async findUsersByWalletsAddress(addresses: string[]) {
    return await this.userRepository.model.aggregate([
      {
        $lookup: {
          from: 'wallets',
          localField: 'managedWallet',
          foreignField: '_id',
          as: 'managedWallet',
        },
      },
      { $unwind: { path: '$managedWallet', preserveNullAndEmptyArrays: true } },
      { $match: { $or: [{ wallets: { $in: addresses } }, { 'managedWallet.address': { $in: addresses } }] } },
    ]);
  }

  async findAllUsers() {
    return await this.userRepository.find();
  }

  async findAllUsersWithWallets() {
    return await this.userRepository.model.find().populate('managedWallet');
  }

  async findAllInterestedUsers() {
    return await this.userRepository.model.find({
      interested: {
        $ne: '',
        $exists: true,
      },
    });
  }

  async findReferredUsersByReferralCode(referralCode: string) {
    const users = await this.userRepository.find({
      referrerCode: referralCode,
    });

    const referredUsers = users.map(({ name, email, createdAt }) => {
      const atIndex = email.indexOf('@');
      const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      return {
        name,
        email: `${email.slice(0, 3)}***${email.slice(atIndex)}`,
        joined: formattedDate,
      };
    });

    return referredUsers;
  }

  async update(id: string, userDataDto: UserDataDto): Promise<User> {
    let claimStatus
    if (userDataDto?.kycStatus !== undefined)
      claimStatus = { ... { $set: { "claim.status": userDataDto?.kycStatus ? KycStatus.confirmed : KycStatus.rejected } } }

    return this.userRepository.model.findByIdAndUpdate(id, { ...userDataDto, ...claimStatus }, {
      new: true,
      runValidators: true,
    });
  }

  async updateUserPermissions(userId: string, permissions: UpdateUserPermissionsDto[]) {
    const user = await this.userRepository.model.findById(userId);

    if (!user)
      throw new BadRequestException('User not found');

    const userPermissions = { ...user.permissions };

    for (const permission of permissions) {
      userPermissions[permission.permissionKey] = permission.actions;
    }

    return await this.userRepository.model.findByIdAndUpdate(user._id, { permissions: userPermissions });
  }


  async updateProfile(user: UserDataDto, updateUserProfileDto: UpdateUserProfileDto): Promise<User> {
    if (updateUserProfileDto?.avatar) {
      const file = await this.fileService.findFileByUrl(user.avatar)
      file ? await this.fileService.delete(file._id) : ""
    }
    const updatedUser = await this.userRepository.update({ _id: user._id }, updateUserProfileDto);
    // Update user in CRM
    if (updatedUser?.bitrix24Id) {
      await this.bitrix24Service.updateLeadById(updatedUser.bitrix24Id, {
        phone: user.phoneNumber,
      });
    }
    return updatedUser;
  }

  async updateThirdPartyProvider(id: string, thirdPartyProvider: ThirdPartyProvider): Promise<User> {
    const user = await this.userRepository.model.findById(id);

    if (user) {
      user.thirdPartyProviders.push(thirdPartyProvider);
      await user.save();
    }

    if (!user.isVerified) {
      // Verify user if login is done with third party provider
      return await this.verifyEmailById(id);
    }
  }

  async updateUserBitrix24Id(id: string, bitrix24Id: number): Promise<User> {
    return await this.userRepository.update({ _id: id }, { bitrix24Id });
  }

  async verifyEmailById(id: string): Promise<User> {
    const user = await this.userRepository.update({ _id: id }, { isVerified: true });
    // Create a lead in Bitrix24
    const leadData: LeadData = {
      name: user.name,
      email: user.email,
      phone: user.phoneNumber,
      walletAddress: '',
      leadSource: '2196',
    };
    const leadAddResponse = await this.bitrix24Service.createLead(leadData);
    if (leadAddResponse?.result) {
      // Save Bitrix24 ID to user
      await this.updateUserBitrix24Id(id, leadAddResponse.result);
    }
    return user;
  }

  async resetPassword(id: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userRepository.update(
      {
        _id: id,
      },
      { password: hashedPassword, resetToken: null }
    );

    if (!user.isVerified) {
      // Verify user if password is reset
      return await this.verifyEmailById(id);
    }
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.model.findById(id);
    if (user?.password) {
      // Check if the current password matches the stored hashed password
      // Compare the hashed version of the current password with the stored hashed password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        throw new BadRequestException('Current password does not match');
      }
    }

    await this.resetPassword(user.id, newPassword);
  }

  // Wallet services
  async assignWalletId(id: string, walletId: string, walletAddress: string): Promise<void> {
    const user = await this.userRepository.model.findByIdAndUpdate(
      id,
      {
        managedWallet: walletId,
        walletType: WalletType.managed,
      },
      {
        new: true,
      }
    );
    // Update user in CRM
    if (user?.bitrix24Id) {
      await this.bitrix24Service.updateLeadById(user.bitrix24Id, {
        walletAddress: walletAddress,
      });
    }
  }

  async assignExternalWalletAddress(id, walletAddress: string) {
    const user = await this.userRepository.model.findById(id);
    if (user && !user.wallets.includes(walletAddress)) {
      user.wallets.push(walletAddress);
      user.walletType = WalletType.external;
      await user.save();
    }
    // Update user in CRM
    if (user?.bitrix24Id) {
      await this.bitrix24Service.updateLeadById(user.bitrix24Id, {
        walletAddress: walletAddress,
      });
    }
    return user;
  }

  async assignWalletAddress(id, walletAddress: string): Promise<boolean> {
    const user = await this.userRepository.model.findById(id);
    if (user && !user.wallets.includes(walletAddress)) {
      user.wallets.push(walletAddress);
      await user.save();
      return true;
    }
    return false;
  }

  // Multiplayer services
  async updateUserTokens(id: string, tokenType) {
    // Update the user's tokens
    const query = {
      $inc: { [`tokens.${tokenType}`]: 1 }, // increment or create the tokenType field under tokens
    };

    return await this.userRepository.model.findByIdAndUpdate(id, query, {
      new: true,
      runValidators: true,
    });
  }

  async updateUserCharacter(id, character) {
    return await this.userRepository.model.findByIdAndUpdate(
      id,
      { character },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  async updateUserLocation(id, playerLocation) {
    return await this.userRepository.model.findByIdAndUpdate(
      id,
      { playerLocation },
      {
        new: true,
        runValidators: true,
      }
    );
  }

  private async generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';

    for (let i = 0; i < 8; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      code += characters.charAt(randomIndex);
    }

    const isDuplicated = await this.userRepository.findOne({
      referralCode: code,
    });

    if (isDuplicated) this.generateReferralCode();

    return code;
  }


  private async isReferrerCodeExists(referrerCode: string) {
    return (await this.findOne({ referralCode: referrerCode })) ? true : false;
  }

  async countUser() {
    const total = await this.userRepository.model.countDocuments();
    return { total };
  }

  async findUsersWithKycNotConfirmed(paginationQueryDto: PaginationQueryDto,status:KycStatus) {
    const { page, pageSize } = paginationQueryDto;
    const skip = (page - 1) * pageSize;

    const [data, totalRecords] = await Promise.all([
      this.userRepository.model
        .find({ 'claim.status': status })
        .select('name email phoneNumber claim createdAt')
        .lean()
        .skip(skip)
        .limit(pageSize)
        .exec(),
      this.userRepository.model.countDocuments({ 'claim.status': status })
    ]);

    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      data,
      pagination: {
        pageSize,
        pageRecords: data.length,
        currentPage: page,
        totalRecords,
        totalPages,
      },
    };
  }

  getUserWallet(user: User) {
    switch (user.walletType) {
      case WalletType.not_connected:
        throw new HttpException('', HttpStatus.BAD_REQUEST);
      case WalletType.managed:
        return user.managedWallet as Wallet
      case WalletType.external:
        return user.wallets
    }
  }

  async verifyUser(verifyUserDto: VerifyUserDto, user: User) {
    if (user.claim?.nationality && user.claim?.idCardImage && user.claim?.idbackCardImage)
      throw new BadRequestException('The data actually exists')
    await this.userRepository.model.findByIdAndUpdate(user._id, { $set: { claim: { ...verifyUserDto, status: KycStatus.pending } } })
    return { message: "success" }
  }
}
