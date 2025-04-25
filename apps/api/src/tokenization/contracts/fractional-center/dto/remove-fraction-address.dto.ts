import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class RemoveFractionAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionalCenterAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionAddress: string;
}
