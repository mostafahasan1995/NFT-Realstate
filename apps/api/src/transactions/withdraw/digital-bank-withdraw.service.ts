import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

@Injectable()
export class DigitalBankWithdrawService {
  private readonly digitalBankApiUrl = 'https://digibankar.com/public/v1/';
  private readonly digitalBankApiKey = process.env.DIGITAL_BANK_API_KEY;

  async getWithdrawLocations(
    pageNo: number,
    pageSize: number
  ): Promise<AxiosResponse<any>> {
    try {
      return await this.makeGetRequest('account/fiat/withdraw/locations', {
        pageNo,
        pageSize,
      });
    } catch (error) {
      console.error('Error getting withdrawal locations:', error.message);
      throw new Error(`Failed to get withdrawal locations: ${error.message}`);
    }
  }

  async getWithdrawAgents(
    locationId: number,
    pageNo: number,
    pageSize: number
  ): Promise<AxiosResponse<any>> {
    try {
      return await this.makeGetRequest('account/fiat/withdraw/agents', {
        districtId: locationId,
        pageNo,
        pageSize,
      });
    } catch (error) {
      console.error('Error getting withdrawal agents:', error.message);
      throw new Error(`Failed to get withdrawal agents: ${error.message}`);
    }
  }

  async getWithdrawFees(
    agentId: string,
    currency: string,
    amount: number
  ): Promise<AxiosResponse<any>> {
    try {
      return await this.makeGetRequest('account/fiat/withdraw/fees', {
        agentId,
        currency,
        amount,
      });
    } catch (error) {
      console.error('Error getting withdrawal fees:', error.message);
      throw new Error(`Failed to get withdrawal fees: ${error.message}`);
    }
  }

  async withdrawCash({
    agentId,
    currency,
    amount,
    recipientName,
    recipientPhone,
  }): Promise<AxiosResponse<any>> {
    try {
      return await this.makePostRequest('account/fiat/withdraw', {
        agentId,
        currency,
        amount,
        recieverName: recipientName,
        recieverPhone: recipientPhone,
      });
    } catch (error) {
      console.error('Error withdrawing cash:', error.message);
      throw new Error(`Failed to withdraw cash: ${error.message}`);
    }
  }

  private async makeGetRequest(
    endpoint: string,
    params?: any
  ): Promise<AxiosResponse<any>> {
    const response = await axios.get(this.digitalBankApiUrl + endpoint, {
      params,
      headers: {
        'x-api-key': this.digitalBankApiKey,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to make GET request to ${endpoint}`);
    }

    return response.data;
  }

  private async makePostRequest(
    endpoint: string,
    data?: any
  ): Promise<AxiosResponse<any>> {
    const response = await axios.post(this.digitalBankApiUrl + endpoint, data, {
      headers: {
        'x-api-key': this.digitalBankApiKey,
      },
    });

    if (response.status !== 200) {
      throw new Error(`Failed to make POST request to ${endpoint}`);
    }

    return response.data;
  }
}
