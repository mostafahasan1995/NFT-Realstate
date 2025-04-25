import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, Min } from 'class-validator';
import { TradingTokenSymbol } from '../enums/trading-tokens-symbol.enum';

export class AssetTradingTokensDto {
  @IsEnum(TradingTokenSymbol)
  @IsNotEmpty()
  readonly symbol: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  readonly maker: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  readonly taker: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  readonly treasury: number;

  @IsBoolean()
  @IsNotEmpty()
  readonly initialListing: boolean;
}
