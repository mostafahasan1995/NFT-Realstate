import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TimelineRepository } from './timeline.repository';
import { CreateTimelineDto } from './dto/create-timeline.dto';
import { CreateTimelineActionDto } from './dto/create-timeline-action.dto';
import { QueryTimelineDto } from './dto/query-timeline.dto';
import { HttpStatusCode } from 'axios';
import { UpdateActionDto } from './dto/update-action.dto';
import { DeleteActionDto } from './dto/delete-action.dto';
import { QueryActionDto } from './dto/query-action.dto';
import { Types } from 'mongoose';

@Injectable()
export class TimelineService {

  constructor(
    private readonly timelineRepository: TimelineRepository,
  ) { }

  async createTimeline(createTimelineDto: CreateTimelineDto) {
    const timeline = await this.timelineRepository.findOne({ asset: createTimelineDto.asset });
    if (timeline)
      throw new HttpException('Timeline already exists', HttpStatusCode.BadRequest);
    return await this.timelineRepository.model.create(createTimelineDto);
  }

  async createAction({ assetId, timelineId, title, message }: CreateTimelineActionDto) {
    if (!assetId && !timelineId)
      throw new HttpException('Asset and Timeline are required', HttpStatusCode.BadRequest);
    const filter = timelineId ? { _id: timelineId } : { asset: assetId };
    const timeline = await this.timelineRepository.model.findOneAndUpdate(
      filter,
      {
        $push: {
          actions: { title, message }
        }
      },
      { new: true }
    );
    return timeline
  }

  async updateAction({ timelineId, actionId, title, message }: UpdateActionDto) {
    if (!message && !title)
      throw new HttpException('message and title are required', HttpStatusCode.BadRequest);
    const newValues: { [x: string]: string } = {}
    if (title) newValues['actions.$[elem].title'] = title;
    if (message) newValues['actions.$[elem].message'] = message;
    const timeline = await this.timelineRepository.model.findOneAndUpdate(
      { _id: timelineId },
      {
        $set: newValues
      },
      { arrayFilters: [{ 'elem._id': actionId }], new: true }
    );
    return timeline
  }

  async deleteAction({ timelineId, actionId }: DeleteActionDto) {
    const timeline = await this.timelineRepository.model.findOneAndUpdate(
      { _id: timelineId },
      {
        $pull: {
          actions: { _id: actionId }
        }
      },
      { new: true }
    );
    return timeline;
  }

  async deleteTimeline(timelineId: string) {
    const timeline = await this.timelineRepository.delete({ _id: timelineId })
    if (!timeline)
      throw new HttpException('timeline not found', HttpStatusCode.BadRequest);

    return { message: "deleted" }
  }


  async findTimeline({ assetId, timelineId }: QueryTimelineDto) {
    if (!assetId && !timelineId)
      throw new HttpException('Asset or Timeline is required', HttpStatusCode.BadRequest);
    const filter = timelineId ? { _id: timelineId } : { asset: assetId };
    const timeline = await this.timelineRepository.model.findOne(filter).exec();
    if (!timeline)
      throw new HttpException('Timeline not found', HttpStatus.BAD_REQUEST);
    return timeline;
  }

  async findAction({ actionId, timelineId }: QueryActionDto) {
    const timeline = await this.timelineRepository.model.findOne({ _id: timelineId }).exec();
    if (!timeline)
      throw new HttpException('Timeline not found', HttpStatus.BAD_REQUEST);

    const action = timeline.actions.find(action => action._id == actionId);
    if (!action)
      throw new HttpException('Action not found', HttpStatus.BAD_REQUEST);
    return action;
  }
}
