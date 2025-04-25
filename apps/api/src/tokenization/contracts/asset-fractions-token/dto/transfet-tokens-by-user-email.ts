import { IsEthereumAddress } from "class-validator"
import { TransferTokensDto } from "./transfet-tokens"

export class TransferTokensByAddressDto extends TransferTokensDto {
  @IsEthereumAddress()
  senderAddress: string
}