import { IsEthereumAddress, IsNotEmpty, IsNumber } from 'class-validator';

export class ApproveFractionAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly assetCollectionAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly assetFractionsTokenAddress: string;

  @IsNumber()
  @IsNotEmpty()
  readonly tokenId: number;
}
