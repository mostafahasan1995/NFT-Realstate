import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class RefundDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fundraisingAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fractionAddress: string;
}
