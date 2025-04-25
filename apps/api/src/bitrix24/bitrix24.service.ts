import {Injectable, OnModuleInit} from '@nestjs/common';
import {Bitrix24Repository} from './bitrix24.repository';
import {OAuthInfoApiResponse} from './interfaces/oauth-info-api-response.interface';
import {LeadDataApiRequest} from './interfaces/lead-data-api-request.interface';
import {LeadData} from './interfaces/lead-data.interface';
import {LeadAddApiResponse} from './interfaces/lead-add-api-response.interface';
import {UpdateLeadDto} from './dto/update-lead.dto';

@Injectable()
export class Bitrix24Service implements OnModuleInit {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly baseUrl = 'https://gamma.bitrix24.com';
  private refreshToken: string;
  private accessToken: string;

  constructor(private readonly bitrix24Repository: Bitrix24Repository) {
    this.clientId = process.env.BITRIX24_CLIENT_ID;
    this.clientSecret = process.env.BITRIX24_CLIENT_SECRET;
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      await this.refreshAccessToken();
      await this.startRefreshingAccessToken();
    }
  }

  async getRefreshToken(code: string): Promise<OAuthInfoApiResponse> {
    const url = `${this.baseUrl}/oauth/token/`;
    const params = {
      grant_type: 'authorization_code',
      client_id: this.clientId,
      client_secret: this.clientSecret,
      code,
    };
    const oAuthInfoApiResponse: OAuthInfoApiResponse = await this.sendRequest(
      'GET',
      url,
      params
    );
    if (oAuthInfoApiResponse.domain === 'gamma.bitrix24.com') {
      this.accessToken = oAuthInfoApiResponse.access_token;
      this.refreshToken = oAuthInfoApiResponse.refresh_token;
      // Save the refresh token in the database
      await this.bitrix24Repository.saveRefreshToken(this.refreshToken);
    }
    return oAuthInfoApiResponse;
  }

  async refreshAccessToken() {
    const refreshToken = await this.bitrix24Repository.getRefreshToken();
    if (refreshToken) {
      const params = {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      };
      const url = `${this.baseUrl}/oauth/token/`;
      const oAuthInfoApiResponse: OAuthInfoApiResponse = await this.sendRequest(
        'GET',
        url,
        params
      );
      if (oAuthInfoApiResponse.domain === 'gamma.bitrix24.com') {
        this.refreshToken = oAuthInfoApiResponse.refresh_token;
        this.accessToken = oAuthInfoApiResponse.access_token;
        // Save the new refresh token in the database
        await this.bitrix24Repository.saveRefreshToken(this.refreshToken);
        // Save the new access token in the database
        await this.bitrix24Repository.saveAccessToken(this.accessToken);
      }
    }
  }

  async createLead(leadData: LeadData): Promise<LeadAddApiResponse> {
    const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.accessToken}`,
      Accept: 'application/json',
    });

    // Map the leadData fields to the ones expected by Bitrix24
    const leadDataApiRequest: LeadDataApiRequest = {
      TITLE: leadData.name,
      NAME: leadData.name,
      EMAIL: [{VALUE: leadData.email, VALUE_TYPE: 'WORK'}],
      PHONE: [{VALUE: leadData.phone, VALUE_TYPE: 'WORK'}],
      SOURCE_ID: 'GAMMA CITIES',
      STATUS_ID: 'NEW',
      OPENED: 'Y',
      UF_CRM_1717168385: leadData.walletAddress, // Wallet Address
      UF_CRM_1715197079: leadData.leadSource, // Lead Source
    };

    try {
      const response = await fetch(`${this.baseUrl}/rest/crm.lead.add.json`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({fields: leadDataApiRequest}),
      });
      if (response.status !== 200) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return (await response.json()) as LeadAddApiResponse;
    } catch (error) {
      console.error('Failed to create lead on Bitrix24', error);
    }
  }

  async getLeads() {
    const url = `${this.baseUrl}/rest/crm.lead.list.json`;
    const params = {
      'order[DATE_CREATE]': 'DESC',
    };

    try {
      const leads = await this.sendRequest('GET', url, params);
      return leads;
    } catch (error) {
      console.error('Failed to get leads from Bitrix24', error);
    }
  }

  async getLeadById(leadId: number) {
    const url = `${this.baseUrl}/rest/crm.lead.get.json`;
    const params = {
      id: leadId,
    };

    try {
      const lead = await this.sendRequest('GET', url, params);
      return lead;
    } catch (error) {
      console.error('Failed to get lead by ID from Bitrix24', error);
    }
  }

  async updateLeadById(leadId: number, {phone, walletAddress}: UpdateLeadDto) {
    const url = `${this.baseUrl}/rest/crm.lead.update.json`;
    const params = {
      id: leadId,
    };

    // Map the updateLeadDto fields to the ones expected by Bitrix24
    const fields: any = {};
    if (phone) {
      fields.PHONE = [
        {
          VALUE: phone,
          VALUE_TYPE: 'WORK',
        },
      ];
    }
    if (walletAddress) {
      fields.UF_CRM_1717168385 = walletAddress;
    }
    const body = {
      fields: fields,
    };

    try {
      const response = await this.sendRequest('POST', url, params, body);
      return response;
    } catch (error) {
      console.error('Failed to update lead by ID on Bitrix24', error);
    }
  }

  async sendRequest(
    method: 'GET' | 'POST',
    url: string,
    fetchParams: any,
    data?: any
  ) {
    const params = new URLSearchParams(fetchParams).toString();
    const response = await fetch(`${url}?${params}`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/json',
      },
      body: method === 'POST' ? JSON.stringify(data) : undefined,
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `HTTP Error: ${response.status}, ${error.error_description}`
      );
    }
    return response.json();
  }

  async startRefreshingAccessToken(): Promise<void> {
    setInterval(async () => {
      await this.refreshAccessToken();
    }, 3_000_000); // 50 minutes
  }
}
