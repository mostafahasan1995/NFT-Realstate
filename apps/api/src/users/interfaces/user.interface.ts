import { Membership } from '../../membership/schemas/membership.schema';
import { Wallet } from '../../wallets/schemas/wallet.schema';
import { KycStatus } from '../enums/kyc-status';
import { ThirdPartyProvider } from './third-party-provider.interface';

export interface IUser {
  name: string;
  username: string;
  email: string;
  phoneNumber: string;
  claim: Claim
  password: string;
  avatar: string
  resetToken: string;
  isAdmin: boolean;
  roles: string[];
  permissions: Record<string, number[]>;
  thirdPartyProviders: ThirdPartyProvider[];
  tokens: object;
  character: string;
  playerLocation: string;
  isVerified: boolean;
  verificationCode: string;
  interested: string;
  kycStatus: boolean;
  referralCode: string;
  referrerCode: string;
  walletType: string;
  wallets: string[];
  managedWallet: Wallet | string;
  bitrix24Id: number;
  membership: Membership | string;
  createdAt: Date;
  updatedAt: Date;
}


export interface Claim {
  nationality: string;
  idCardImage: string;
  idbackCardImage: string;
  residence: string;
  photoCamera: string;
  status: string;
}