import {IsNotEmpty, IsNumber, IsEthereumAddress, Min} from 'class-validator';

export class UnlistOrderDto {
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
}
