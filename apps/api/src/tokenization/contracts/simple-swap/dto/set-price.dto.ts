import { IsEthereumAddress, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class SetPriceDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly poolAddress: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  readonly price: number;
}
