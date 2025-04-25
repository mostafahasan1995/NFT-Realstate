import { IsNotEmpty, IsString } from 'class-validator';

export class DeployAssetFractionsTokenDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly symbol: string;
}
