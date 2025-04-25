import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collection: 'contractAssetFundraising',
})
export class ContractAssetFundraising {
  @Prop()
  assetFundraisingAddress: string;

  @Prop()
  assetFractionsTokenAddress: string;

  @Prop()
  startDate: number;

  @Prop()
  fundraisingPeriod: number;
}

export const ContractAssetFundraisingSchema = SchemaFactory.createForClass(
  ContractAssetFundraising
);
