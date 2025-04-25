import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class SetAllowedTokenDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly assetFundraisingAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly tokenAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly poolAddress: string;
}
