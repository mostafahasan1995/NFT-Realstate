import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

class Fees {
  @Prop()
  maker: string;

  @Prop()
  taker: number;
}

@Schema({
  timestamps: true,
  collection: 'tokenizationIncomeDistributors',
})
export class TokenizationIncomeDistributor {
  @Prop()
  orderBookAddress: string;

  @Prop()
  ownerAddress: string;

  @Prop({index: true})
  fractionsAddress: string;

  @Prop([Fees])
  fees: Fees[];
}

export const TokenizationIncomeDistributorSchema = SchemaFactory.createForClass(
  TokenizationIncomeDistributor
);
