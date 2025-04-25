import { IsEthereumAddress, IsNotEmpty, IsNumber } from 'class-validator';

export class SetFeesDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly orderBookAddress: string;

  @IsNumber()
  @IsNotEmpty()
  readonly makerFee: number;

  @IsNumber()
  @IsNotEmpty()
  readonly takerFee: number;
}
