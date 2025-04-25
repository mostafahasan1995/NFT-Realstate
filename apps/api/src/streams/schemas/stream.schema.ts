import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collection: 'streams',
})
export class Stream {
  @Prop()
  name: string;
}

export const StreamSchema = SchemaFactory.createForClass(Stream);
