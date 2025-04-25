import { IsNotEmpty, IsEthereumAddress } from 'class-validator';

export class BalanceOfDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly orderBookAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly userAddress: string;
}
