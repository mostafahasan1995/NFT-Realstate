import {
  IsEthereumAddress,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class DepositBankTransferDto {
  @IsString()
  @IsNotEmpty()
  readonly bankAccount: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  readonly totalAmount: number;

  @IsNumber()
  @Min(0.1)
  @IsNotEmpty()
  readonly exchangeRate: number;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly recipientWalletAddress: string;

  @IsMongoId()
  @IsNotEmpty()
  readonly invoice: string;
}
