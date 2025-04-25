export class RequestWithdrawCashEvent {

  userId: string
  sentAmount: number
  referenceId: string
  constructor(userId: string, sentAmount: number, referenceId: string) {
    this.userId = userId
    this.sentAmount = sentAmount
    this.referenceId = referenceId
  }
}