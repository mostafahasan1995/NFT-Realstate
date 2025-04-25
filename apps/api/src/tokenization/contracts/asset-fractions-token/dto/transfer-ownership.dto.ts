import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class TransferOwnershipDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly assetFractionsTokenAddress: string;
}
