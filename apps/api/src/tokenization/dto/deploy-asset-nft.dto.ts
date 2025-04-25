import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class DeployAssetNftDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly assetCollectionAddress: string;
}
