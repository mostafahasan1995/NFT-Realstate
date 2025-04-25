import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../common/base.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmailSubscribers } from './schema/email-subscribers.dto';

@Injectable()
export class EmailSubscribersRepository extends BaseRepository<EmailSubscribers> {
  constructor(
    @InjectModel(EmailSubscribers.name)
    private readonly emailSubscribersModel: Model<EmailSubscribers>
  ) {
    super(emailSubscribersModel);
  }
}
