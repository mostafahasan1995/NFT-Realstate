import { IsNotEmpty, IsString } from 'class-validator';

export class BalanceOfDto {
  @IsString()
  @IsNotEmpty()
  readonly fractionAddress: string;

  @IsString()
  @IsNotEmpty()
  readonly walletAddress: string;
}
