import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class MinterRoleDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly walletAddress: string;
}
