import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class SetOrderBookAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly orderBookAddress: string;
}
