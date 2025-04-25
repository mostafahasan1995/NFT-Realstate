import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CashbackStatus } from '../enum/cashback-status.enum';

@Schema({ timestamps: true, collection: 'membership-cashback' })
export class MembershipCashback extends Document {
  @Prop()
  buyerId: string;

  @Prop()
  assetId: string;

  @Prop({ required: true, min: 0 })
  cashback: number;

  @Prop({ required: true, min: 0 })
  earnedCashback: number

  @Prop({ required: true, min: 0 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  unitPrice: number

  @Prop({
    type: String,
    enum: Object.values(CashbackStatus),
    default: CashbackStatus.Pending,
    index: true,
  })
  status: string;

  @Prop({ required: true, type: String })
  hashAddress: string

  createdAt: Date;
  updatedAt: Date;
}

export const MembershipCashbackSchema = SchemaFactory.createForClass(MembershipCashback);
