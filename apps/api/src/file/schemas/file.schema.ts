import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  collection: 'files',
})
export class File extends Document {
  @Prop()
  originalname: string;

  @Prop({index: true})
  filename: string;

  @Prop()
  caption: string;

  @Prop()
  url: string;
}

export const FileSchema = SchemaFactory.createForClass(File);
