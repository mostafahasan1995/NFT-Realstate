import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsNumber,
  IsString,
  IsEnum,
  Min,
  IsMongoId,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CurrencyCode } from '../enums/currency-code.enum';
import { AssetStatus } from '../enums/asset-status.enum';
import { AssetCategory } from '../enums/asset-category.enum';
import { AssetTradingTokensDto } from './asset-trading-tokens.dto';

export class UpdateAssetDto {
  @IsString()
  @IsOptional()
  readonly name: string;

  @IsObject()
  @IsOptional()
  readonly about: { [langSymbol: string]: string };

  @IsEnum(AssetStatus)
  @IsOptional()
  readonly status: string;

  @IsString()
  @IsOptional()
  readonly country: string;

  @IsString()
  @IsOptional()
  readonly city: string;

  @IsString()
  @IsOptional()
  readonly state: string;

  @IsString()
  @IsOptional()
  readonly location: string;

  @IsEnum(AssetCategory)
  @IsOptional()
  readonly category: string;

  @IsOptional()
  readonly propertiesInfo: object;

  @IsNumber()
  @Min(1)
  @IsOptional()
  readonly fractions: number;

  @IsBoolean()
  @IsOptional()
  readonly visible: boolean;

  @IsOptional()
  @IsBoolean()
  readonly funded: boolean;

  @IsOptional()
  @IsBoolean()
  readonly deployed: boolean;

  @IsOptional()
  @IsBoolean()
  readonly isSecondaryMarket: boolean;

  @IsNumber()
  @Min(1)
  @IsOptional()
  readonly marketValue: number;

  @IsEnum(CurrencyCode)
  @IsOptional()
  readonly currency: string;

  @ValidateNested({ each: true })
  @Type(() => AssetTradingTokensDto)
  @IsOptional()
  readonly tradingTokens: AssetTradingTokensDto[];

  @IsNumber()
  @Min(1)
  @IsOptional()
  readonly grossYield: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  readonly netYield: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  readonly capAppreciation: number;

  @IsOptional()
  @IsNumber()
  readonly price: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
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
  readonly expectedGrowthRate: number

  @IsOptional()
  @IsNumber()
  readonly transactionExpenses: number

  @IsOptional()
  @IsString({ each: true })
  readonly showTo: string[]

  @IsOptional()
  @IsString({ each: true })
  readonly restrictedTo: string[]
}
