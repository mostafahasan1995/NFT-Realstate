import { IsNotEmpty, IsString } from 'class-validator';

export class DeployAssetCollectionContractDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly tracker: string;
}
