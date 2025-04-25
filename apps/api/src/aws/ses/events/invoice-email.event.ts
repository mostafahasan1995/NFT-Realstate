export class InvoiceEmailEvent {
  email: string;
  name: string;
  assetLink: string;
  assetImage: string;
  transactionId: string;
  assetName: string;
  numOfFractions: string;
  totalAmount: string;

  constructor(
    email: string,
    name: string,
    assetLink: string,
    assetImage: string,
    transactionId: string,
    assetName: string,
    numOfFractions: string,
    totalAmount: string
  ) {
    this.email = email;
    this.name = name;
    this.assetLink = assetLink;
    this.assetImage = assetImage;
    this.transactionId = transactionId;
    this.assetName = assetName;
    this.numOfFractions = numOfFractions;
    this.totalAmount = totalAmount;
  }
}
