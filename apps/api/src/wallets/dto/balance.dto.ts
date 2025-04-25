import { IsNotEmpty, IsString } from 'class-validator';

export class BalanceDto {
  @IsString()
  @IsNotEmpty()
  readonly tokenAddress: string;

  @IsString()
  @IsNotEmpty()
  readonly walletAddress: string;
}
