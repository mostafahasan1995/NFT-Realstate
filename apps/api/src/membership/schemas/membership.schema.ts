import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IMembership } from '../interfaces/membership.interface';

@Schema({ timestamps: true, collection: 'membership' })
export class Membership extends Document implements IMembership {
  @Prop()
  name: string;

  @Prop({ required: true, min: 0 })
  minPurchaseLimit: number;

  @Prop({ required: true, min: 0 })
  maxPurchaseLimit: number;

  @Prop({ required: true, min: 0 })
  cashback: number;

  createdAt: Date;
  updatedAt: Date;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);
