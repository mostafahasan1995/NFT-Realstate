import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsString,
  MinLength,
  IsEnum,
  IsOptional,
  Min,
  IsMongoId,
  Max,
  ArrayNotEmpty,
  ArrayMinSize,
  IsObject,
} from 'class-validator';
import { CurrencyCode } from '../enums/currency-code.enum';
import { AssetCategory } from '../enums/asset-category.enum';
import { TradingTokenSymbol } from '../enums/trading-tokens-symbol.enum';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  readonly name: string;

  @IsObject()
  @IsOptional()
  readonly about: { [langSymbol: string]: string };

  @IsString()
  @IsNotEmpty()
  readonly country: string;

  @IsString()
  @IsOptional()
  readonly city: string;

  @IsString()
  @IsOptional()
  readonly state: string;

  @IsString()
  @IsNotEmpty()
  readonly location: string;

  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  readonly deedInfo: string;

  @IsEnum(AssetCategory)
  @IsNotEmpty()
  readonly category: string;

  @IsNotEmpty()
  readonly propertiesInfo: object;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  readonly fractions: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  readonly marketValue: number;

  @IsEnum(CurrencyCode)
  @IsNotEmpty()
  readonly currency: string;

  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsEnum(TradingTokenSymbol, { each: true })
  readonly tradingTokens: string[];

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  readonly grossYield: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsNotEmpty()
  readonly netYield: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsNotEmpty()
  readonly capAppreciation: number;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  readonly minPrice: number;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  readonly images: string[];

  @IsOptional()
  @IsMongoId()
  readonly assetBlueprintImage: string;

  @IsOptional()
  @IsNumber()
  expectedGrowthRate: number

  @IsOptional()
  @IsNumber()
  transactionExpenses: number


}
