import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { ThirdPartyProvider } from '../interfaces/third-party-provider.interface';
import { Wallet } from '../../wallets/schemas/wallet.schema';
import { WalletType } from '../enums/wallet-type.enum';
import { Claim, IUser } from '../interfaces/user.interface';
import { Membership } from '../../membership/schemas/membership.schema';
import { KycStatus } from '../enums/kyc-status';

@Schema({ timestamps: true, collection: 'users' })
export class User extends Document implements IUser {
  @Prop()
  name: string;

  @Prop({ unique: true, sparse: true })
  username: string;

  @Prop({ unique: true, index: true, uniqueCaseInsensitive: true })
  email: string;

  @Prop()
  avatar: string;

  @Prop({ unique: true, index: true, sparse: true })
  phoneNumber: string;

  @Prop({
    type: {
      nationality: String,
      idCardImage: String,
      idbackCardImage: String,
      residence: String,
      photoCamera: String,
      status: String
    },
    default: ({ status: KycStatus.notConfirmed })
  })
  claim: Claim

  @Prop()
  birthCountry: string

  @Prop({ default: null })
  password: string;

  @Prop()
  resetToken: string;

  @Prop({ type: Boolean, default: false })
  isAdmin: boolean;

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop({ type: {} })
  permissions: Record<string, number[]>;

  @Prop({ type: [Object], default: [] })
  thirdPartyProviders: ThirdPartyProvider[];

  @Prop({ type: Object, default: {} })
  tokens: object;

  @Prop({ default: '' })
  character: string;

  @Prop({ default: '' })
  playerLocation: string;

  @Prop({ type: Boolean, default: false })
  isVerified: boolean;

  @Prop()
  verificationCode: string;

  @Prop({ default: '', index: true })
  interested: string;

  @Prop({ default: false })
  kycStatus: boolean;

  @Prop({ index: true })
  referralCode: string;

  @Prop({ index: true })
  referrerCode: string;

  @Prop({
    type: String,
    enum: Object.values(WalletType),
    default: WalletType.not_connected,
  })
  walletType: string;

  @Prop({ type: [String], default: [] })
  wallets: string[];

  // Identifier for the managed wallet within the wallets collection
  @Prop({ type: Types.ObjectId, ref: Wallet.name, autopopulate: true })
  managedWallet: Wallet | string;

  @Prop({ index: true })
  bitrix24Id: number;

  @Prop({ type: Types.ObjectId, ref: Membership.name, autopopulate: true })
  membership: Membership | string;

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
