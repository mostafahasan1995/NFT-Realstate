import { FundraisingStatus } from '../contracts/asset-fundraising/types/fundraising-status.type';

export interface UserFraction {
  name: string;
  roi: number;
  fractionAddress: string;
  fundraisingAddress: string;
  capAppreciation: number;
  grossYield: number;
  fundraisingStatus?: FundraisingStatus;
  numOfFractions: number;
  fractionTotalPrice: number;
}
