import { IsNotEmpty, IsEthereumAddress } from 'class-validator';

export class FractionAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionAddress: string;
}
