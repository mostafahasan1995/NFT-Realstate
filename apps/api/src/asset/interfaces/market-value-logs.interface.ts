import { File } from '../../file/schemas/file.schema';

export interface MarketValueLogs {
  marketValue: number;
  docs: File[] | string[];
}
