import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { File } from '../../file/schemas/file.schema';
import { AssetStatus } from '../enums/asset-status.enum';
import { CurrencyCode } from '../enums/currency-code.enum';
import { AssetCategory } from '../enums/asset-category.enum';
import { AssetTradingToken } from '../interfaces/asset-trading-tokens.interface';
import { Asset as AssetInterface } from '../interfaces/asset.interface';
import { MarketValueLogs, MarketValueLogsSchema } from './market-value.schema';
import { DocumentAsset, DocumentAssetSchema } from './document-asset.schema';
import { FundraisingType } from '../enums/asset-fundraising-type.enum';

@Schema({
  timestamps: true,
  collection: 'assets',
})
export class Asset extends Document implements AssetInterface {
  @Prop()
  name: string;

  @Prop({ index: true })
  slug: string;

  @Prop({ index: true, unique: true })
  symbol: string;

  @Prop({ type: Object })
  about: { [langSymbol: string]: string };

  @Prop({
    type: String,
    enum: Object.values(AssetStatus),
    default: AssetStatus.ComingSoon,
    index: true
  })
  status: string;

  @Prop()
  country: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  location: string;

  @Prop({ unique: true })
  deedInfo: string;

  @Prop({
    type: String,
    enum: Object.values(AssetCategory),
  })
  category: string;

  @Prop({ type: Object, default: {} })
  propertiesInfo: object;

  @Prop()
  nftId: string;

  @Prop()
  nftCollectionAddress: string;

  @Prop()
  nftFractionAddress: string;

  @Prop()
  nftFundraisingAddress: string;

  @Prop({
    type: String,
    enum: Object.values(FundraisingType),
    default: FundraisingType.normalFundraising,
  })
  fundraisingType: FundraisingType

  @Prop()
  tokenVestingAddress: string;

  @Prop({ index: true })
  nftOrderBookAddress: string;

  @Prop({ type: Boolean, default: false })
  isSecondaryMarket: boolean;

  @Prop({ type: Number, default: 10000 })
  fractions: number;

  @Prop({ default: false })
  funded: boolean;

  @Prop({ default: true })
  visible: boolean;

  @Prop({ default: false, index: true })
  deployed: boolean;

  @Prop()
  fundraisingStartTime: number;

  @Prop()
  fundraisingEndTime: number;

  @Prop([Object])
  tradingTokens: AssetTradingToken[];

  @Prop()
  marketValue: number;

  @Prop({
    type: String,
    enum: Object.values(CurrencyCode),
    default: CurrencyCode.USD,
  })
  currency: string;

  @Prop({ type: Number, default: 0 })
  grossYield: number;

  @Prop({ type: Number, default: 0 })
  netYield: number;

  @Prop()
  fractionPrice: number;

  @Prop({ type: Number, default: 500 })
  minPrice: number;

  @Prop()
  capAppreciation: number;

  @Prop({ type: Number, default: 0 })
  roi: number;

  @Prop({ type: Types.ObjectId, ref: File.name, autopopulate: true })
  assetBlueprintImage: File | string;

  @Prop({
    type: [{ type: Types.ObjectId, ref: File.name, autopopulate: true }],
  })
  images: File[] | string[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: File.name, autopopulate: true }],
  })
  docs: File[] | string[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: File.name, autopopulate: true }],
  })
  incomeDocs: File[] | string[];

  @Prop({
    type: [{ type: Types.ObjectId, ref: File.name, autopopulate: true }],
  })
  marketValueDocs: File[] | string[];

  @Prop({
    type: [
      {
        type: MarketValueLogsSchema,
        ref: MarketValueLogs.name,
        autopopulate: true,
      },
    ],
  })
  marketValueLogs: MarketValueLogs[] | string[];

  @Prop({ type: Number, default: 0 })
  expectedGrowthRate: number

  @Prop({ type: Number, default: 0 })
  transactionExpenses: number

  @Prop({
    type: [{ type: DocumentAssetSchema, ref: DocumentAsset.name, autopopulate: true }],
  })
  documentAsset: DocumentAsset[]

  @Prop({ type: [String] })
  showTo: string[]

  @Prop({ type: [String] })
  restrictedTo: string[];

  createdAt: Date;
  updatedAt: Date;
}

export const AssetSchema = SchemaFactory.createForClass(Asset);
