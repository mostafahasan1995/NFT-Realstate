import { Injectable } from '@nestjs/common';
import { Withdraw } from './schemas/withdraw.schema';
import { BaseRepository } from '../../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class WithdrawRepository extends BaseRepository<Withdraw> {
  constructor(@InjectModel(Withdraw.name) withdrawModel: Model<Withdraw>) {
    super(withdrawModel);
  }
}
