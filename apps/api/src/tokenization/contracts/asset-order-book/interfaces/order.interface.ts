export interface IOrder {
  orderId: number;
  amount: number;
  owner: string;
  price: number;
  tokenAddress: string;
  minAmount: number;
}
