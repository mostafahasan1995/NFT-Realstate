export interface LeadAddApiResponse {
  result: number;
  time: {
    start: number;
    finish: number;
    duration: number;
    processing: number;
    date_start: string;
    date_finish: string;
    operating_reset_at: number;
    operating: number;
  };
}
