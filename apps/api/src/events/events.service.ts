import { Injectable } from '@nestjs/common';
import { AvailableFractionDto } from './dto/available-fraction.dto';
import { TokenizationService } from '../tokenization/tokenization.service';

@Injectable()
export class EventsService {
  constructor(private readonly tokenizationService: TokenizationService) {}

  async getSummaryFractionAssets() {
    return await this.tokenizationService.getSummaryFractionForAllAssets();
  }

  async getSummaryFraction({ assetId }: AvailableFractionDto) {
    return await this.tokenizationService.getSummaryFractionByAssetId(assetId);
  }
}
