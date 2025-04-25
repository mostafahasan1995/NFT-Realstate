import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class GetPriceDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly contractAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly tokenAddress: string;
}
