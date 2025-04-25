import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collection: 'multiplayer_tokens',
})
export class Token {
  @Prop()
  tokenId: number;

  @Prop()
  tokenType: string;

  @Prop({index: true})
  playerId: string;

  @Prop({ default: false, index: true})
  spawned: boolean;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
