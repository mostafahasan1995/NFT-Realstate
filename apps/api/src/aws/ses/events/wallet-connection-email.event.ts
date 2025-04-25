export class WalletConnectionEmailEvent {
  email: string;
  name: string;
  walletAddress: string;

  constructor(email: string, name: string, walletAddress: string) {
    this.email = email;
    this.name = name;
    this.walletAddress = walletAddress;
  }
}
