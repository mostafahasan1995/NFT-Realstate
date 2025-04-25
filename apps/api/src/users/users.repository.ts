import { Injectable } from '@nestjs/common';
import { User } from './schemas/user.schema';
import { BaseRepository } from '../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>
  ) {
    super(userModel);
  }
}
