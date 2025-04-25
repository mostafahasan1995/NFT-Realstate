import { Injectable } from '@nestjs/common';

import { Model } from 'mongoose';
import { BaseRepository } from '../../common/base.repository';
import { Timeline } from './schema/timeline.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class TimelineRepository extends BaseRepository<Timeline> {
  constructor(
    @InjectModel(Timeline.name)
    private readonly assetModel: Model<Timeline>
  ) {
    super(assetModel);
  }
}