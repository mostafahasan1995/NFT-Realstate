import { IsEthereumAddress, IsNotEmpty, IsNumber } from 'class-validator';

export class ListOrderDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly orderBookAddress: string;

  @IsNumber()
  @IsNotEmpty()
  readonly amount: number;

  @IsNumber()
  @IsNotEmpty()
  readonly price: number;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly priceToken: string;

  @IsNumber()
  @IsNotEmpty()
  readonly minAmount: number;
}
