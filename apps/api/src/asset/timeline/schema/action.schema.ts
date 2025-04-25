import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ActionInterface } from '../interface/action.interface';


@Schema({
  timestamps: true,
  collection: 'timelines',
})
export class Action extends Document implements ActionInterface {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String })
  message: string;

  createdAt: Date;
  updatedAt: Date;
}

export const ActionSchema = SchemaFactory.createForClass(Action);
