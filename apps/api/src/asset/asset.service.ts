import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { FilterQuery as MongooseFilterQuery, Types } from 'mongoose';
import slugify from 'slugify';
import { Asset } from './schemas/asset.schema';
import { FilterQueryDto } from './dto/filter-query.dto';
import { FindAssetPaginationDto } from './dto/find-asset-pagination.dto';
import { AssetStatus } from './enums/asset-status.enum';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';
import { AssetRepository } from './asset.repository';
import { CreateAssetDto } from './dto/create-asset.dto';
import { AssetTradingToken } from './interfaces/asset-trading-tokens.interface';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { ContractsService } from '../contracts/contracts.service';
import { SearchQuery } from '../common/pagination/interfaces/search-query.interface';
import { FilterQuery } from '../common/pagination/interfaces/filter-query.interface';
import { DocsDto } from './dto/docs.dto';
import { MarketValueDocsDto } from './dto/market-value.dto';
import { UpdateAssetDocDto } from './dto/asset-docs.dto';
import { DocumentAsset } from './schemas/document-asset.schema';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AssetStatusChangedEvent } from '../aws/ses/events/asset-status-chenged.event';

@Injectable()
export class AssetService implements OnModuleInit {
  constructor(
    private readonly assetRepository: AssetRepository,
    private readonly contractsService: ContractsService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  async onModuleInit() {
    await this.finalizedAssetStatusToActive();
  }

  async createAsset(createAssetDto: CreateAssetDto): Promise<Asset> {
    try {
      // Generate a unique lowercase symbol
      const symbol = await this.generateUniqueSymbol(createAssetDto.name);

      // Generate a slug from the name and ensure it's unique
      const slug = await this.generateUniqueSlug(createAssetDto.name);

      // Calculate roi field
      const roi = createAssetDto.capAppreciation + createAssetDto.netYield;

      // Create trading tokens with the token address
      const tradingTokens = this.generateTradingTokens(createAssetDto.tradingTokens);

      // Create the asset with the unique lowercase symbol and slug
      const assetData = {
        ...createAssetDto,
        tradingTokens,
        symbol,
        slug,
        roi,
      };

      // Calculate the price based on marketValue and fractions
      const fractionPrice = assetData.marketValue / assetData.fractions;

      // Create and save the asset to the database
      const asset = await this.assetRepository.create({
        ...assetData,
        fractionPrice: fractionPrice,
      });

      return asset;
    } catch (error) {
      throw new BadRequestException(`Validation failed: ${error.message}`);
    }
  }



  async findAll(paginationQueryDto: PaginationQueryDto, filterQueryDto: FilterQueryDto): Promise<FindAssetPaginationDto> {
    return await this._findAll(paginationQueryDto, filterQueryDto);
  }

  async findAllByUserNationality(paginationQueryDto: PaginationQueryDto, filterQueryDto: FilterQueryDto, userNationality?: string): Promise<FindAssetPaginationDto> {

    const filter: FilterQuery = {
      $or: [
        { showTo: { $size: 0 } },
        { showTo: { $exists: false } }
      ]
    };

    if (userNationality) (filter['$or'] as { showTo: string }[]).push({ showTo: userNationality })

    return await this._findAll(paginationQueryDto, { ...filter, ...filterQueryDto });
  }


  private async _findAll(paginationQueryDto: PaginationQueryDto, filterQuery: Record<string, any>): Promise<FindAssetPaginationDto> {
    const {
      visible,
      status,
      isSecondaryMarket,
      country,
      city,
      category,
      search,
      $or
    } = filterQuery;

    const categories = category ? category.split(',') : [];

    // Create an empty filter object with dynamic properties.
    const filter: FilterQuery = {
      visible,
      status,
      isSecondaryMarket,
      country,
      city,
      $or
    };

    if (categories.length > 0) filter.category = { $in: categories };


    const searchQuery: SearchQuery = {
      name: search,
    };

    return await this.assetRepository.findWithPagination(paginationQueryDto, filterQuery, searchQuery);
  }

  async findOne(assetData: Partial<Asset>): Promise<Asset> {
    return await this.assetRepository.findOne(assetData as MongooseFilterQuery<Asset>);
  }

  async find(assetData: Partial<Asset>): Promise<Asset[]> {
    return await this.assetRepository.find(assetData as MongooseFilterQuery<Asset>);
  }

  async findAllDeployed(): Promise<Asset[]> {
    return await this.assetRepository.find({
      deployed: true,
      status: AssetStatus.Active,
    });
  }

  async findDeployedWithStartTime(): Promise<Asset[]> {
    const currentTimestamp = new Date().getTime() / 1000;
    return await this.assetRepository.find({
      deployed: true,
      fundraisingStartTime: { $lte: currentTimestamp },
    });
  }

  async updateData(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    const asset = await this.assetRepository.findOne({ _id: id });
    if (!asset) {
      throw new BadRequestException(`Asset not found`);
    }

    if (asset?.deployed && asset.status === AssetStatus.Active) {
      // Exclude fields that are not allowed to be updated after deployment
      const { name, status, location, propertiesInfo, fractions, visible, funded, deployed, isSecondaryMarket, marketValue, currency, tradingTokens, price, minPrice, images, ...restUpdateAssetDto } = updateAssetDto;

      await this.assetRepository.update({ _id: id }, restUpdateAssetDto);
    } else {
      await this.assetRepository.update({ _id: id }, updateAssetDto);
      await this.updateAssetTradingTokens(id);
    }

    return await this.updateAssetPriceAndRoi(id);
  }

  async updateAssetTradingTokens(id: string): Promise<Asset | null> {
    const asset = await this.assetRepository.findOne({ _id: id });

    if (asset && asset.tradingTokens.length > 0) {
      const tradingTokens = asset.tradingTokens.map((token) => {
        const tradingToken = this.contractsService.getTokenBySymbol(token.symbol);
        return {
          ...token,
          address: tradingToken?.tokenAddress,
        };
      });
      return await this.assetRepository.update(
        { _id: id },
        {
          tradingTokens,
        }
      );
    }
    return null;
  }

  async updateDocs(id: string, { docs }: DocsDto): Promise<Asset> {
    return await this.assetRepository.update(
      { _id: id },
      {
        docs,
      }
    );
  }

  async updateAssetDocs(asset: Asset, updateAssetDocDto: UpdateAssetDocDto) {

    const existingDocumentAssetType = asset.documentAsset?.find((docAsset) => docAsset.type === updateAssetDocDto.type);
    if (existingDocumentAssetType) {
      await this.assetRepository.model.updateOne(
        {
          _id: asset._id,
          'documentAsset.type': updateAssetDocDto.type
        },
        {
          $addToSet: {
            'documentAsset.$.docs': { $each: updateAssetDocDto.docs },
          },
        }
      );
    } else {
      await this.assetRepository.model.updateOne(
        { _id: asset._id },
        {
          $push: {
            documentAsset: updateAssetDocDto,
          },
        }
      );
    }

    return { message: 'updated ' }
  }


  async updateIncomeDocs(id: string, { docs }: DocsDto): Promise<Asset> {
    return await this.assetRepository.update(
      { _id: id },
      {
        incomeDocs: docs,
      }
    );
  }

  async updateMarketValueWithDocs(id: string, { marketValue, docs }: MarketValueDocsDto): Promise<Asset> {
    // Update market value with logs
    await this.assetRepository.model.findByIdAndUpdate(
      id,
      {
        marketValue,
        marketValueDocs: docs,
        $push: {
          marketValueLogs: {
            marketValue,
            docs,
          },
        },
      },
      { new: true, runValidators: true }
    );

    return await this.updateAssetPriceAndRoi(id);
  }

  async updateAssetPriceAndRoi(id: string): Promise<Asset> {
    const asset = await this.assetRepository.findOne({ _id: id });
    const fractionPrice = asset.marketValue / asset.fractions;
    asset.fractionPrice = fractionPrice;
    asset.roi = asset.capAppreciation + asset.grossYield;
    await asset.save();
    return asset;
  }

  async updateAssetNftCollectionData(id: string, nftCollectionAddress: string, nftId: string): Promise<Asset> {
    return await this.assetRepository.update(
      { _id: id },
      {
        nftCollectionAddress,
        nftId,
      }
    );
  }

  async updateAssetNftFundraisingData(id: string, nftFundraisingAddress: string, fundraisingStartTime: number, fundraisingEndTime: number, tokenVestingAddress?: string): Promise<Asset> {
    return await this.assetRepository.update(
      { _id: id },
      {
        nftFundraisingAddress,
        fundraisingStartTime,
        fundraisingEndTime,
        tokenVestingAddress
      }
    );
  }

  async updateAssetNftFractionAddress(id: string, nftFractionAddress: string): Promise<Asset> {
    return await this.assetRepository.update(
      { _id: id },
      {
        nftFractionAddress,
      }
    );
  }

  async updateAssetNftOrderBookAddress(id: string, nftOrderBookAddress: string): Promise<Asset> {
    return await this.assetRepository.update(
      { _id: id },
      {
        nftOrderBookAddress,
      }
    );
  }

  async updateAssetToDeployed(id: string): Promise<Asset> {
    return await this.assetRepository.update(
      { _id: id },
      {
        deployed: true,
      }
    );
  }

  async updateAssetToSecondaryMarket(id: string): Promise<Asset> {
    return await this.assetRepository.update(
      { _id: id },
      {
        isSecondaryMarket: true,
      }
    );
  }

  async extendFundraisingEndTime(fundraisingAddress: string, extraTime: number): Promise<Asset> {
    return await this.assetRepository.model.findOneAndUpdate({ nftFundraisingAddress: fundraisingAddress }, { $inc: { fundraisingEndTime: extraTime } }, { new: true });
  }

  async resetAssetDeployData(id: string): Promise<void> {
    await this.assetRepository.update(
      { _id: id },
      {
        deployed: false,
        status: AssetStatus.ComingSoon,
        nftCollectionAddress: '',
        nftId: '',
        nftFractionAddress: '',
        nftFundraisingAddress: '',
        nftOrderBookAddress: '',
      }
    );
  }

  private async finalizedAssetStatusToActive(): Promise<void> {
    setInterval(async () => {
      const currentTimestamp = new Date().getTime() / 1000;
      await this.assetRepository.model.updateMany(
        {
          deployed: true,
          status: AssetStatus.ComingSoon,
          fundraisingStartTime: { $lte: currentTimestamp },
        },
        { status: AssetStatus.Active }
      );
    }, 300_000);
  }

  async updateAssetStatusToActive(id: string): Promise<void> {
    await this.assetRepository.update(
      {
        _id: id,
      },
      { status: AssetStatus.Active }
    );
  }

  async updateAssetStatusToSold(id: string): Promise<void> {
    const asset = await this.assetRepository.update(
      {
        _id: id,
      },
      { status: AssetStatus.Sold }
    );
    this.eventEmitter.emit('asset.change-status', new AssetStatusChangedEvent(asset.name, asset.status))
  }

  async updateAssetStatusToFailed(id: string): Promise<void> {
    const asset = await this.assetRepository.update(
      {
        _id: id,
      },
      { status: AssetStatus.Failed }
    );
    this.eventEmitter.emit('asset.change-status', new AssetStatusChangedEvent(asset.name, asset.status))
  }

  async delete(id: string): Promise<Asset> {
    return await this.assetRepository.delete({ _id: id });
  }

  validateAssetDeployData(asset: Asset): void {
    const requiredFields = ['name', 'symbol', 'deedInfo', 'fractions', 'location', 'marketValue', 'fractionPrice', 'currency', 'images'];
    if (asset.tradingTokens.length < 1) throw new BadRequestException('Asset is missing tradingTokens field');
    if (asset.images.length < 1) throw new BadRequestException('Asset is missing images field');
    for (const field of requiredFields) {
      if (!asset[field]) {
        throw new BadRequestException(`Asset is missing ${field} field`);
      }
    }
  }

  private generateTradingTokens(tradingTokens: string[]): AssetTradingToken[] {
    // Get all trading tokens
    const tokens = this.contractsService.getTradingTokens();
    // Initialize trading tokens with the token address
    return tokens.map((token) => {
      const initialListing = tradingTokens.includes(token.symbol);
      return {
        symbol: token.symbol,
        address: token.tokenAddress,
        maker: 0,
        taker: 0,
        treasury: 0,
        initialListing,
      };
    });
  }

  private async generateUniqueSymbol(name: string): Promise<string> {
    // Convert name to lowercase and remove spaces/special characters
    const cleanedName = name.toLowerCase().replace(/\s+/g, '');
    let symbol = slugify(cleanedName, { lower: true });

    // Check if the generated symbol is unique
    let isUnique = false;
    let counter = 1;

    while (!isUnique) {
      // Check if the symbol already exists in the database
      const existingAsset = await this.assetRepository.findOne({ symbol });

      if (!existingAsset) {
        isUnique = true;
      } else {
        // Append a unique identifier (e.g., counter) and try again
        symbol = `${symbol}${counter}`;
        counter++;
      }
    }

    return symbol;
  }

  private async generateUniqueSlug(name: string): Promise<string> {
    // Generate an initial slug
    let slug = slugify(name, { lower: true });

    // Check if the generated slug is unique
    let isUnique = false;
    let counter = 1;

    while (!isUnique) {
      // Check if the slug already exists in the database
      const existingAsset = await this.assetRepository.findOne({ slug });

      if (!existingAsset) {
        isUnique = true;
      } else {
        // Append a unique identifier (e.g., counter) and try again
        slug = `${slug}-${counter}`;
        counter++;
      }
    }

    return slug;
  }

  async getTotalMarketValue() {
    const assets = await this.assetRepository.model.aggregate([
      {
        $match: {
          status: { $in: [AssetStatus.Active, AssetStatus.Sold] },
        },
      },
      {
        $group: {
          _id: null,
          marketValue: { $sum: '$marketValue' },
        },
      },
    ]);
    return { totalMarketValue: assets[0]?.marketValue || 0 }
  }
}
