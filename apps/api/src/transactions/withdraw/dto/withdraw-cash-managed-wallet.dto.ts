import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class WithdrawCashMangedWalletDto {
  @IsString()
  @IsNotEmpty()
  readonly bankName: string;

  @IsString()
  @IsNotEmpty()
  readonly bankAccount: string;

  @IsString()
  @IsNotEmpty()
  readonly bankAccountName: string;

  @IsString()
  @IsNotEmpty()
  readonly currency: string;

  @IsNumber()
  @Min(10)
  @IsNotEmpty()
  readonly gusdAmount: number;

  @IsNumber()
  @Min(0.01)
  @IsNotEmpty()
  readonly exchangeRate: number;
}
