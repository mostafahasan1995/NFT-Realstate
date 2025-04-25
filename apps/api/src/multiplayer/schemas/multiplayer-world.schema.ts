import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collection: 'multiplayer_worlds',
})
export class World {
  @Prop()
  worldName: string;
  @Prop()
  mode: string;
  @Prop()
  videoUrl: string;
}

export const WorldSchema = SchemaFactory.createForClass(World);
