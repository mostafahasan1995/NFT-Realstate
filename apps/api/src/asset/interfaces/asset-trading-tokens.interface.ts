export interface AssetTradingToken {
  symbol: string;
  address?: string;
  maker: number;
  taker: number;
  treasury: number;
  initialListing: boolean;
}
