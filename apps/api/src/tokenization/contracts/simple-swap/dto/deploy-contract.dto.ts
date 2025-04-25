import { IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class DeployContractDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly tokenAddress: string;
}
