import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class EmailSubscribers extends Document {
  @Prop({ unique: true })
  email: string

}

export const EmailSubscribersSchema = SchemaFactory.createForClass(EmailSubscribers);
