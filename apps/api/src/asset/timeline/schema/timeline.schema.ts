import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Asset } from '../../schemas/asset.schema';
import { TimelineInterface } from '../interface/timeline.interface';
import { Action } from './action.schema';


@Schema({
  timestamps: true,
  collection: 'timelines',
})
export class Timeline extends Document implements TimelineInterface {

  @Prop({ type: Types.ObjectId, ref: Asset.name })
  asset: Asset;

  @Prop({
    type: [{
      type: Action,
      ref: Action.name,
      autopopulate: true,
    }]
  })
  actions: Action[]

  createdAt: Date;
  updatedAt: Date;
}

export const TimelineSchema = SchemaFactory.createForClass(Timeline);
