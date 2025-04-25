
export interface IAffiliate {
  buyerId: string;
  assetId: string;
  referrerCode: string;
  fundraisingAddress: string;
  hashAddress: string;
  quantity: number;
  unitPrice: number;
  commission: number;
  cashbackGranted: boolean
}
