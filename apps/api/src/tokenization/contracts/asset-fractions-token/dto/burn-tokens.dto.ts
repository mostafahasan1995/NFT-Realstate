import { IsEthereumAddress, IsNumber } from "class-validator"

export class BurnTokensDto {
  @IsEthereumAddress()
  nftFractionAddress: string

  @IsEthereumAddress()
  from: string

  @IsNumber()
  amount: number


}