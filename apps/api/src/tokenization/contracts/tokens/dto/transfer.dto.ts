import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  Max,
  Min,
} from 'class-validator';

export class TransferDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly recipientAddress: string;

  @IsNumber()
  @Min(0)
  @Max(1_000_000)
  @IsNotEmpty()
  readonly amount: number;
}
