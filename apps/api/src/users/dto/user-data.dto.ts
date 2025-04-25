import { ThirdPartyProvider } from '../interfaces/third-party-provider.interface';

export class UserDataDto {
  _id?: string;

  name?: string;

  username?: string;

  email?: string;

  password?: string;

  resetToken?: string;

  phoneNumber?: string;

  nationality?: string

  photo?: string;

  avatar?: string

  isAdmin?: boolean;

  roles?: string[];

  permissions?: Record<number, number[]>;

  thirdPartyProviders?: ThirdPartyProvider[];

  tokens?: object;

  character?: string;

  playerLocation?: string;

  isVerified?: boolean;

  verificationCode?: string;

  interested?: string;

  kycStatus?: boolean;

  referralCode?: string;

  referrerCode?: string;

  walletType?: string;

  wallets?: string[];

  managedWallet?: string;

  membership?: string;
}
