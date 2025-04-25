import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
  collection: 'contractAssetCollections',
})
export class ContractAssetCollection {
  @Prop()
  assetCollectionAddress: string;

  @Prop()
  ownerAddress: string;

  @Prop()
  name: string;

  @Prop()
  tracker: string;

  @Prop({ type: [Object] })
  tokenIds: object[];
}

export const ContractAssetCollectionSchema = SchemaFactory.createForClass(
  ContractAssetCollection
);
