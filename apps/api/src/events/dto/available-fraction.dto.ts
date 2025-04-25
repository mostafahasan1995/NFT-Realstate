import { IsMongoId, IsNotEmpty } from 'class-validator';

export class AvailableFractionDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly assetId: string;
}
