import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { IAffiliate } from '../interfaces/affiliate.interface';
import { AffiliateStatus } from '../enums/affiliate-status.enum';
import { User } from '../../users/schemas/user.schema';

@Schema({
  timestamps: true,
  collection: 'affiliates',
})
export class Affiliate extends Document implements IAffiliate {
  @Prop()
  buyerId: string;

  @Prop({
    type: String,
    enum: Object.values(AffiliateStatus),
    default: AffiliateStatus.Pending,
    index: true,
  })
  status: string;

  @Prop()
  assetId: string;

  @Prop({ index: true })
  referrerCode: string;

  @Prop()
  fundraisingAddress: string;

  @Prop()
  quantity: number;

  @Prop()
  unitPrice: number;

  @Prop({ type: Number })
  commission: number;

  @Prop({ index: true })
  hashAddress: string;

  @Prop({ default: false })
  cashbackGranted: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export const AffiliateSchema = SchemaFactory.createForClass(Affiliate);
