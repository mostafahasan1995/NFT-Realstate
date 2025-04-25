import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';
import {DepositStatus} from '../enums/deposit-status.enum';
import {File} from '../../../file/schemas/file.schema';
import {User} from '../../../users/schemas/user.schema';

@Schema({
  timestamps: true,
  collection: 'deposits',
})
export class Deposit extends Document {
  @Prop({
    type: Types.ObjectId,
    ref: User.name,
    autopopulate: {
      select: {_id: 1, name: 1, username: 1, email: 1, managedWallet: 1},
    },
    index: true,
  })
  userId: User | string;

  @Prop()
  bankAccount: string;

  @Prop()
  totalAmount: number;

  @Prop()
  exchangeRate: number;

  @Prop()
  recipientWalletAddress: string;

  @Prop({
    type: String,
    enum: Object.values(DepositStatus),
    default: DepositStatus.Pending,
  })
  status: string;

  @Prop({index: true})
  referenceId: string;

  @Prop()
  notes: string;

  @Prop({type: Types.ObjectId, ref: File.name, autopopulate: true})
  invoice: File | string;

  @Prop()
  gusdAmount: number;

  @Prop()
  hashAddress: string;

  createdAt: Date;
  updatedAt: Date;
}

export const DepositSchema = SchemaFactory.createForClass(Deposit);
