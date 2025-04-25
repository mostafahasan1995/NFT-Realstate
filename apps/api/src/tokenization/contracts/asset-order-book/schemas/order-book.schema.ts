import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class Order {
  @Prop({index: true})
  orderId: number;

  @Prop()
  owner: string;

  @Prop()
  amount: number;

  @Prop()
  price: number;

  @Prop()
  tokenAddress: string;

  @Prop()
  tokenSymbol: string;

  @Prop()
  minAmount: number;
}

@Schema({
  timestamps: true,
  collection: 'tokenizationOrderBooks',
})
export class TokenizationOrderBook {
  @Prop()
  orderBookAddress: string;

  @Prop()
  ownerAddress: string;

  @Prop({index: true})
  fractionsAddress: string;

  @Prop()
  makerFee: string;

  @Prop()
  takerFee: number;

  @Prop({ type: Array, default: [] })
  orders: Order[];
}

export const TokenizationOrderBookSchema = SchemaFactory.createForClass(
  TokenizationOrderBook
);
