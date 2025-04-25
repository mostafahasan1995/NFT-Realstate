import { IsEthereumAddress, IsMongoId, IsNotEmpty } from 'class-validator';

export class FractionBalanceDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly assetId: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly walletAddress: string;
}
