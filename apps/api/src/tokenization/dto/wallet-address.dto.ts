import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class WalletAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly walletAddress: string;
}
