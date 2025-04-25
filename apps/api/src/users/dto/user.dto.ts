import { Exclude, Type } from 'class-transformer';
import { Wallet } from '../../wallets/schemas/wallet.schema';
import { User } from '../schemas/user.schema';
import { TransformObjectId } from '../../common/decorators/transform-objectId.decorator';
import { WalletDto } from '../../wallets/dto/wallet.dto';

export class UserDto {
  @TransformObjectId()
  _id: string;

  @Exclude()
  password: string;

  @Exclude()
  resetToken: string;

  @Type(() => WalletDto)
  managedWallet: Wallet | string;

  @Exclude()
  __v: number;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial.toJSON ? partial.toJSON() : partial);
  }
}
