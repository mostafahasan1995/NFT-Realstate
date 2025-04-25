import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { } from 'rxjs';
import * as jwt from 'jsonwebtoken';
import axios from 'axios';

const appId = process.env.NAFATH_APP_ID ?? '';
const appKey = process.env.NAFATH_APP_KEY ?? '';
const headers = () => ({
  'APP-ID': appId,
  'APP-KEY': appKey,
  'Content-Type': 'application/json',
})

@Injectable()
export class NafathService {
  private readonly baseUrl = process.env.NAFATH_BASE_URL || 'https://nafath.api.elm.sa/api/';

  private includeBaseUrl(path: string) {
    return this.baseUrl + path;
  }

  /**
   * Send authentication request to Nafath
   * @param nationalId - User's national ID
   * @param service - Service type (e.g., "Login", "OpenAccount")
   */

  async sendRequest(nationalId: string, service: string) {
    const url = this.includeBaseUrl('v1/mfa/request');
    const body = { nationalId, service };

    try {
      const response = await axios.post(url, body, { headers: headers() })
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Failed to send request', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Retrieve the status of an existing authentication request
   * @param nationalId - User's national ID
   * @param transId - Transaction ID returned from `sendRequest`
   * @param random - Random number from `sendRequest`
   */

  async getRequestStatus(nationalId: string, transId: string, random: string) {
    const url = this.includeBaseUrl('v1/mfa/request/status');
    const body = { nationalId, transId, random };

    try {
      const response = await axios.post(url, body, { headers: headers() })

      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Failed to retrieve status', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Handle callback from Nafath when user accepts/rejects authentication request
   * @param token - JWT token received from Nafath callback
   */

  async handleCallback(token: string) {
    const jwk = await this.getJWK();
    const publicKey = this.extractPublicKey(jwk);

    try {
      const decoded = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
      return decoded;
    } catch (error) {
      throw new HttpException('Invalid JWT token', HttpStatus.UNAUTHORIZED);
    }
  }

  /**
   * Retrieve JSON Web Key (JWK) from Nafath for JWT verification
   */

  async getJWK() {
    const url = this.includeBaseUrl('v1/mfa/jwk');

    try {
      const response = await axios.get(url, { headers: headers() })
      return response.data;
    } catch (error) {
      throw new HttpException(error.response?.data || 'Failed to retrieve JWK', HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Extract public key from JWK
   * @param jwk - JSON Web Key retrieved from Nafath
   */

  private extractPublicKey(jwk: any): string {
    const key = jwk.keys[0]; // Assuming first key is correct
    return `-----BEGIN PUBLIC KEY-----\n${key.n}\n-----END PUBLIC KEY-----`;
  }
}
