import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssetStatus } from '../enums/asset-status.enum';

export class FilterQueryDto {
  @IsString()
  @IsEnum(AssetStatus)
  @IsOptional()
  readonly status: string;

  @IsOptional()
  readonly visible: boolean;

  @IsOptional()
  readonly isSecondaryMarket: boolean;

  @IsString()
  @IsOptional()
  readonly category: string;

  @IsString()
  @IsOptional()
  readonly search: string;

  @IsString()
  @IsOptional()
  readonly country: string;

  @IsString()
  @IsOptional()
  readonly city: string;
}
