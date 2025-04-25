export class WalletLowBalanceEvent {
  walletAddress: string;
  balance: number
  constructor(walletAddress: string, balance: number) {
    this.walletAddress = walletAddress;
    this.balance = balance
  }
}
