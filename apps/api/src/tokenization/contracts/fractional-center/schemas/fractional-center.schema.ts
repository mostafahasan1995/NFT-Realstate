import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collection: 'tokenizationFractionalCenters',
})
export class TokenizationFractionalCenter {
  @Prop({index: true})
  fractionalCenterAddress: string;

  @Prop({ default: false, index: true })
  isActiveCenter: boolean;
}

export const TokenizationFractionalCenterSchema = SchemaFactory.createForClass(
  TokenizationFractionalCenter
);
