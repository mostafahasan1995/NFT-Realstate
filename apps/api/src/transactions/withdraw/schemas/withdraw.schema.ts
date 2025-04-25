import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {File} from '../../../file/schemas/file.schema';
import {WithdrawStatus} from '../enums/withdraw-status.enum';
import {User} from '../../../users/schemas/user.schema';

@Schema({
  timestamps: true,
  collection: 'withdraws',
})
export class Withdraw extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    autopopulate: {
      select: {_id: 1, name: 1, username: 1, email: 1, managedWallet: 1},
    },
    index: true,
  })
  userId: User | string;

  @Prop({index: true})
  referenceId: string;

  @Prop()
  bankName: string;

  @Prop()
  bankAccount: string;

  @Prop()
  bankAccountName: string;

  @Prop()
  currency: string;

  @Prop()
  gusdAmount: number;

  @Prop()
  exchangeRate: number;

  @Prop({
    type: String,
    enum: Object.values(WithdrawStatus),
    default: WithdrawStatus.Pending,
    index: true,
  })
  status: string;

  @Prop()
  notes: string;

  @Prop({type: Types.ObjectId, ref: File.name, autopopulate: true})
  invoice: File | string;

  @Prop()
  sentAmount: number;

  @Prop({index: true})
  hashAddress: string;

  createdAt: Date;
  updatedAt: Date;
}

export const WithdrawSchema = SchemaFactory.createForClass(Withdraw);
