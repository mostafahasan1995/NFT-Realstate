import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class AddFractionAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionalCenterAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionAddress: string;
}
