import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class GetPriceDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly poolAddress: string;
}
