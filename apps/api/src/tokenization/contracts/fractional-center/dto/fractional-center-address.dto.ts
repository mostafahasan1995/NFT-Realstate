import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class FractionalCenterAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionalCenterAddress: string;
}
