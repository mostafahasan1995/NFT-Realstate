import { IsNotEmpty, IsString } from 'class-validator';

export class DeployDto {
  @IsString()
  @IsNotEmpty()
  readonly fractionsTokenAddress: string;

  @IsString()
  @IsNotEmpty()
  readonly distributorAddress: string;

  @IsString()
  @IsNotEmpty()
  readonly orderBookAddress: string;
}
