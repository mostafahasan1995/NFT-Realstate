import {
  IsEthereumAddress,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class MintTokenDto {
  @IsString()
  @IsEthereumAddress()
  readonly assetCollectionAddress: string;

  @IsString()
  @IsNotEmpty()
  readonly deedInfo: string;

  @IsString()
  @IsNotEmpty()
  readonly location: string;

  @IsNumber()
  @IsNotEmpty()
  readonly mv: number;

  @IsString()
  @IsNotEmpty()
  readonly mvCurrency: string;

  @IsNumber()
  @IsNotEmpty()
  readonly mvTimestamp: number;

  @IsString()
  @IsNotEmpty()
  readonly url: string;
}
