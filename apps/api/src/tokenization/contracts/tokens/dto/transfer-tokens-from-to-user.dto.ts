import { IsEthereumAddress, IsNotEmpty } from "class-validator";
import { TransferDto } from "./transfer.dto";

export class TransferTokensByAddressDto extends TransferDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  readonly senderAddress: string
}