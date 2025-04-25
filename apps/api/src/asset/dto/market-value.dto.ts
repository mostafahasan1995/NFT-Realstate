import { IsArray, IsMongoId, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class MarketValueDocsDto {
  @IsArray()
  @IsMongoId({ each: true })
  readonly docs: string[];

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  readonly marketValue: number;
}
