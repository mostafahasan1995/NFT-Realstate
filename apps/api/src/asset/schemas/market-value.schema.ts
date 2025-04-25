import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MarketValueLogs as MarketValueLogsInterface } from '../interfaces/market-value-logs.interface';
import { File } from '../../file/schemas/file.schema';

@Schema({
  timestamps: true,
  collection: 'assets',
})
export class MarketValueLogs
  extends Document
  implements MarketValueLogsInterface {
  @Prop({ type: Number })
  marketValue: number;

  @Prop({
    type: [{ type: Types.ObjectId, ref: File.name, autopopulate: true }],
  })
  docs: File[] | string[];

  createdAt: Date;
  updatedAt: Date;
}

export const MarketValueLogsSchema = SchemaFactory.createForClass(MarketValueLogs);
