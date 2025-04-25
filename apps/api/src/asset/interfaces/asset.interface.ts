import { File } from '../../file/schemas/file.schema';
import { FundraisingType } from '../enums/asset-fundraising-type.enum';
import { DocumentAsset } from '../schemas/document-asset.schema';
import { AssetTradingToken } from './asset-trading-tokens.interface';
import { MarketValueLogs } from './market-value-logs.interface';

export interface Asset {
  name: string;
  slug: string;
  symbol: string;
  about: { [langSymbol: string]: string };
  status: string;
  country: string;
  city: string;
  state: string;
  location: string;
  deedInfo: string;
  category: string;
  propertiesInfo: object;
  nftId: string;
  nftCollectionAddress: string;
  nftFractionAddress: string;
  nftFundraisingAddress: string;
  fundraisingType: FundraisingType
  tokenVestingAddress: string;
  nftOrderBookAddress: string;
  isSecondaryMarket: boolean;
  fractions: number;
  funded: boolean;
  visible: boolean;
  deployed: boolean;
  fundraisingEndTime: number;
  fundraisingStartTime: number;
  tradingTokens: AssetTradingToken[];
  marketValue: number;
  currency: string;
  grossYield: number;
  netYield: number;
  fractionPrice: number;
  minPrice: number;
  capAppreciation: number;
  roi: number;
  assetBlueprintImage: File | string;
  images: File[] | string[];
  docs: File[] | string[];
  incomeDocs: File[] | string[];
  transactionExpenses: number
  expectedGrowthRate: number;
  marketValueDocs: File[] | string[];
  marketValueLogs: MarketValueLogs[] | string[];
  documentAsset?: DocumentAsset[] | string[];
  showTo: string[]
  restrictedTo: string[]
  createdAt?: Date;
  updatedAt?: Date;
}
