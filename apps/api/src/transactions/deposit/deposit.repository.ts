import { Injectable } from '@nestjs/common';
import { Deposit } from './schemas/deposit.schema';
import { BaseRepository } from '../../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class DepositRepository extends BaseRepository<Deposit> {
  constructor(@InjectModel(Deposit.name) depositModel: Model<Deposit>) {
    super(depositModel);
  }
}
