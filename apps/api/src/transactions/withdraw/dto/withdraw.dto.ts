import { Type } from 'class-transformer';
import { TransformObjectId } from '../../../common/decorators/transform-objectId.decorator';
import { ProfileDto } from '../../../users/dto/profile.dto';
import { Withdraw } from '../schemas/withdraw.schema';

export class WithdrawDto {
  @TransformObjectId()
  _id: string;
  @Type(() => ProfileDto)
  userId: ProfileDto

  constructor(partial: Partial<Withdraw>) {
    Object.assign(this, partial.toJSON ? partial.toJSON() : partial);
  }
}
