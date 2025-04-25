import {
  IsHash,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  Min,
} from 'class-validator';

export class WithdrawCashDto {
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

  @Matches(/^0x[a-fA-F0-9]{64}$/i)
  @IsNotEmpty()
  readonly hashAddress: string;
}
