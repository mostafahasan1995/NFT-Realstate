import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Membership } from './schemas/membership.schema';

@Injectable()
export class MembershipRepository extends BaseRepository<Membership> {
  constructor(
    @InjectModel(Membership.name)
    private readonly membershipModel: Model<Membership>) {
    super(membershipModel);
  }

}
