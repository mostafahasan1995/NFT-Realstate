import { IsEthereumAddress, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class MintTokensDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly walletAddress: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  readonly amount: number;
}
