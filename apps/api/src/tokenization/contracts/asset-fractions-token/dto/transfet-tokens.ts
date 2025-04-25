import { IsEthereumAddress, IsNumber, IsString } from "class-validator"

export class TransferTokensDto {
  @IsString()
  nftFractionAddress: string

  @IsString()
  @IsEthereumAddress()
  sendTo: string

  @IsNumber()
  amount: number
}