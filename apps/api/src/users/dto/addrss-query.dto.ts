import { IsNotEmpty, IsString } from 'class-validator';

export class WalletAddressQueryDto {
  @IsString()
  @IsNotEmpty()
  readonly address: string;
}
