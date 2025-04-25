import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from '../../users/schemas/user.schema';
import { EmailAction } from '../enums/email-action.enum';

@Schema({ timestamps: true, collection: 'emails' })
export class Email {
  @Prop({
    type: String,
    enum: Object.values(EmailAction),
    index: true,
  })
  emailAction: string;

  @Prop()
  from: string;

  @Prop()
  to: string;

  // Identifier for the userId within the users collection
  @Prop({ type: Types.ObjectId, ref: User.name, autopopulate: true })
  userId: User;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
