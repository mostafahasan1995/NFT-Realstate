import { IOrder } from '../../asset-order-book/interfaces/order.interface';

export interface IFractionOrder {
  fractionAddress: string;
  orderBookAddress: string;
  orders: IOrder[];
}
