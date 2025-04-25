import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class FractionalAndWalletDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionalCenterAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly walletAddress: string;
}
