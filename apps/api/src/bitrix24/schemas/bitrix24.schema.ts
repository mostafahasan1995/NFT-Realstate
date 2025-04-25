import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collection: 'bitrix24',
})
export class Bitrix24 {
  @Prop({
    index: true,
  })
  refreshToken: string;

  @Prop({
    index: true,
  })
  accessToken: string;

  createdAt: Date;
  updatedAt: Date;
}

export const Bitrix24Schema = SchemaFactory.createForClass(Bitrix24);
