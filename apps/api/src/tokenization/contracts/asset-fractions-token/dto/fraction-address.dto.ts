import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class FractionAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionAddress: string;
}
