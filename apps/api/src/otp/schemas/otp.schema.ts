import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { OtpActionType } from '../types/otp-action-type.type';

@Schema({ timestamps: true, collection: 'otps' })
export class Otp extends Document {
  @Prop({ type: String })
  otpActionType: OtpActionType;

  @Prop()
  email: string;

  @Prop()
  secret: string;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
