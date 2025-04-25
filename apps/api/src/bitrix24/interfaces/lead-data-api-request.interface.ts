export interface LeadDataApiRequest {
  TITLE: string;
  NAME: string;
  EMAIL: {
    VALUE: string;
    VALUE_TYPE: string;
  }[];
  PHONE: {
    VALUE: string;
    VALUE_TYPE: string;
  }[];
  SOURCE_ID: string;
  STATUS_ID: string;
  OPENED: string;
  UF_CRM_1717168385: string; // Wallet address
  UF_CRM_1715197079: string; // Lead source
}
