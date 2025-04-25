import { User } from "../../users/schemas/user.schema"

export class BuyFractionEvent {
  user: User
  assetId: string
  hashAddress: string
  quantity: number
  unitPrice: number
  transactionFees: number

  constructor({
    user,
    assetId,
    hashAddress,
    quantity,
    unitPrice,
    transactionFees,
  }
  ) {
    this.user = user
    this.assetId = assetId
    this.hashAddress = hashAddress
    this.quantity = quantity
    this.unitPrice = unitPrice
    this.transactionFees = transactionFees
  }
}
