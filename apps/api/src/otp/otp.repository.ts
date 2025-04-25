import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './schemas/otp.schema';
import { BaseRepository } from '../common/base.repository';
import { OtpActionType } from './types/otp-action-type.type';

@Injectable()
export class OtpRepository extends BaseRepository<Otp> {
  constructor(@InjectModel(Otp.name) otpModel: Model<Otp>) {
    super(otpModel);
  }

  async findLatestOtpForEmailAndType(
    email: string,
    otpActionType: OtpActionType
  ) {
    return await this.model
      .findOne({ email, otpActionType })
      .sort({ createdAt: -1 });
  }
}
