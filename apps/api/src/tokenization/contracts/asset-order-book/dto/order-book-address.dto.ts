import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class OrderBookAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly orderBookAddress: string;
}
