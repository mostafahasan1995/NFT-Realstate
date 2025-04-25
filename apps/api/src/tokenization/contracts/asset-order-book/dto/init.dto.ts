import { IsNotEmpty, IsEthereumAddress } from 'class-validator';

export class InitDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly orderBookAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionAddress: string;
}
