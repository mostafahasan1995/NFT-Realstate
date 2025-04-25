import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as crypto from 'crypto';
import { CreateStreamDto } from './dto/create-stream.dto';
import { UpdateStreamDto } from './dto/update-stream.dto';

@Injectable()
export class StreamsService {
  private apiPublicKey = process.env.API_PUBLIC_KEY;
  private apiSecret = process.env.API_SECRET;
  private baseUrl = process.env.BASE_URL;

  private generateHMACSignature(
    method: string,
    path: string,
    body = ''
  ): string {
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    const payload = `${
      this.apiPublicKey
    }${method.toUpperCase()}/app-stream-management/v2${path}${timestamp}${nonce}${body}`;
    const signature = crypto
      .createHmac('sha256', this.apiSecret)
      .update(payload)
      .digest('hex');
    return `HMAC ${this.apiPublicKey}:${signature}:${nonce}:${timestamp}`;
  }

  async handleApiRequest(req: any, method: string, path: string): Promise<any> {
    const body = JSON.stringify(req.body);
    const signature = this.generateHMACSignature(method, path, body);
    const fullUrl = new URL(`${this.baseUrl}${path}`);
    Object.keys(req.query).forEach((key) =>
      fullUrl.searchParams.set(key, req.query[key])
    );

    try {
      const response = await axios({
        method,
        url: fullUrl.toString(),
        headers: {
          Authorization: signature,
          'Content-Type': 'application/json',
        },
        data: body ? JSON.parse(body) : undefined,
      });
      return response.data;
    } catch (error) {
      throw new Error(error.message);
    }
  }

  create(createStreamDto: CreateStreamDto) {
    return 'This action adds a new stream';
  }

  findAll() {
    return `This action returns all streams`;
  }

  findOne(id: number) {
    return `This action returns a #${id} stream`;
  }

  update(id: number, updateStreamDto: UpdateStreamDto) {
    return `This action updates a #${id} stream`;
  }

  remove(id: number) {
    return `This action removes a #${id} stream`;
  }
}
