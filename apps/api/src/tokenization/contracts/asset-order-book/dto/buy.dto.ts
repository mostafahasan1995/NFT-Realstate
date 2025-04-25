import {IsNotEmpty, IsNumber, IsEthereumAddress, Min} from 'class-validator';

export class BuyOrderDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly orderBookAddress: string;

  @IsNumber()
  @IsNotEmpty()
  readonly orderId: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  readonly amount: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  readonly price: number;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly tokenAddress: string;
}
