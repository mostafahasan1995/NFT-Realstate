import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'forms',
})
export class Form extends Document {
  @Prop()
  name: string;

  @Prop()
  email: string;

  @Prop()
  phoneNumber: string;

  @Prop()
  numberOfAttendees: number;

  @Prop()
  message: string;

  @Prop()
  formType: string;

  @Prop()
  nationality: string;

  @Prop()
  residenceLocation: string;


  createdAt: Date;
  updatedAt: Date;
}

export const FormSchema = SchemaFactory.createForClass(Form);
