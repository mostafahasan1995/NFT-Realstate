export interface OAuthInfoApiResponse {
  access_token: string;
  expires: number;
  expires_in: number;
  scope: string;
  domain: string;
  server_endpoint: string;
  status: string;
  client_endpoint: string;
  member_id: string;
  user_id: number;
  refresh_token: string;
}
