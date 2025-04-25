import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BuyFractionDto {
  @IsString()
  @IsNotEmpty()
  readonly assetId: string;

  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @IsString()
  @IsNotEmpty()
  readonly buyToken: string;
}
