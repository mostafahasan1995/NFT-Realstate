import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class BalanceDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly walletAddress: string;
}
