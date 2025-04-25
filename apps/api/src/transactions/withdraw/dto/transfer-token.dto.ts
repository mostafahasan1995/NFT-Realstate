import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class TransferTokenDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly recipientAddress: string;

  @IsNumber()
  @Min(1)
  @IsNotEmpty()
  readonly amount: number;

  @IsString()
  @IsNotEmpty()
  readonly otp: string;
}
