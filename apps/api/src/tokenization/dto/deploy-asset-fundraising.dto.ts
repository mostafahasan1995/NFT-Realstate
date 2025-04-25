import { IsNotEmpty, IsInt, Min } from 'class-validator';

export class DeployAssetFundraisingDto {
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  readonly startDate: number;

  @IsInt()
  @Min(1)
  @IsNotEmpty()
  readonly fundraisingPeriod: number;
}
