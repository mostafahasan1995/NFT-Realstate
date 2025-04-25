import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class OrderBookAndWalletDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly orderBookAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly walletAddress: string;
}
