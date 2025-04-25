import { IsEthereumAddress, IsNotEmpty, IsNumber, Min } from 'class-validator';

export class DeployFundraisingDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly assetFractionsTokenAddress: string;

  @IsNumber()
  @IsNotEmpty()
  readonly fundraisingPeriod: number;

  @IsNumber()
  @IsNotEmpty()
  readonly startDate: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  readonly fees: number;

  @IsEthereumAddress()
  @IsNotEmpty()
  readonly quoteToken: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  readonly price: number;
}
