import { IsEthereumAddress, IsNotEmpty, IsNumber } from 'class-validator';

export class ExtendFundraisingDurationDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly assetFundraisingAddress: string;

  @IsNumber()
  @IsNotEmpty()
  readonly newDuration: number;
}
