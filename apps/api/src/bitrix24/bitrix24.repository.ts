import {Injectable} from '@nestjs/common';
import {Bitrix24} from './schemas/bitrix24.schema';
import {BaseRepository} from '../common/base.repository';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';

@Injectable()
export class Bitrix24Repository extends BaseRepository<Bitrix24> {
  constructor(
    @InjectModel(Bitrix24.name)
    private readonly bitrix24Model: Model<Bitrix24>
  ) {
    super(bitrix24Model);
  }

  async saveRefreshToken(token: string): Promise<void> {
    try {
      // Find a document and update it, or if it doesn't exist, create a new one
      await this.bitrix24Model.findOneAndUpdate(
        {},
        {refreshToken: token},
        {upsert: true}
      );
    } catch (error) {
      console.error('Error saving refresh token:', error);
    }
  }

  async saveAccessToken(token: string): Promise<void> {
    try {
      // Find a document and update it, or if it doesn't exist, create a new one
      await this.bitrix24Model.findOneAndUpdate(
        {},
        {accessToken: token},
        {upsert: true}
      );
    } catch (error) {
      console.error('Error saving access token:', error);
    }
  }

  async getRefreshToken(): Promise<string> {
    try {
      const refreshToken = await this.bitrix24Model.findOne();
      if (!refreshToken) {
        throw new Error('No document found in the database.');
      }
      return refreshToken.refreshToken;
    } catch (error) {
      console.error('Error getting refresh token:', error);
    }
  }
}
