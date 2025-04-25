import { Exclude } from 'class-transformer';
import { TransformObjectId } from '../../common/decorators/transform-objectId.decorator';
import { Wallet } from '../schemas/wallet.schema';

export class WalletDto {
  @TransformObjectId()
  readonly _id: string;

  @Exclude()
  readonly key: string;

  @Exclude()
  readonly __v: number;

  constructor(partial: Partial<Wallet>) {
    Object.assign(this, partial.toJSON ? partial.toJSON() : partial);
  }
}
