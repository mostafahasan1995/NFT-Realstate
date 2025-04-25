import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'wallets' })
export class Wallet extends Document {
  @Prop()
  userId: string;

  @Prop()
  address: string;

  @Prop()
  key: string;

  @Prop({ default: false })
  archive: boolean;

  @Prop({ type: Date })
  archiveDate: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
