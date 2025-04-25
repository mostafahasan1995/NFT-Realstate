import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class CreateExternalWalletDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly address: string;
}
