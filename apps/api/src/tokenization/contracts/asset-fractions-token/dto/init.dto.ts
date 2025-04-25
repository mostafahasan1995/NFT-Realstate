import { IsEthereumAddress, IsNotEmpty, IsNumber } from 'class-validator';

export class InitDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly assetFractionsTokenAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly nftCollectionAddress: string;

  @IsNumber()
  @IsNotEmpty()
  readonly tokenId: number;

  @IsNumber()
  @IsNotEmpty()
  readonly supplyCap: number;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly minter: string;
}
