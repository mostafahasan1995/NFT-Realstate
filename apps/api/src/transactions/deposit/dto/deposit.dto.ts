import { Type } from 'class-transformer';
import { Deposit } from '../schemas/deposit.schema';
import { TransformObjectId } from '../../../common/decorators/transform-objectId.decorator';
import { ProfileDto } from '../../../users/dto/profile.dto';

export class DepositDto {
  @TransformObjectId()
  _id: string;
  @Type(() => ProfileDto)
  userId: ProfileDto

  constructor(partial: Partial<Deposit>) {
    Object.assign(this, partial.toJSON ? partial.toJSON() : partial);
  }
}
