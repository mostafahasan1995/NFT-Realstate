import { IsNotEmpty, IsEthereumAddress } from 'class-validator';

export class FundraisingAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly fundraisingAddress: string;
}
