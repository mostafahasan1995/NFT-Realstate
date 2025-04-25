import { Controller, Get, Param, NotFoundException, Query, UseInterceptors, ClassSerializerInterceptor, Request } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { FilterQueryDto } from './dto/filter-query.dto';
import { Public } from '../auth/decorators/public.decorator';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';
import { AssetSerializerDto } from './dto/asset-serializer.dto';
import { KycStatus } from '../users/enums/kyc-status';

@Public()
@ApiTags('assets')
@Controller('assets')
@UseInterceptors(ClassSerializerInterceptor)
export class AssetController {
  constructor(private readonly assetService: AssetService) { }

  @Get()
  async findAll(@Query() paginationQueryDto: PaginationQueryDto, @Query() filterDto: FilterQueryDto, @Request() { user }) {
    const assets = await this.assetService
      .findAllByUserNationality(paginationQueryDto, filterDto, user?.claim?.status === KycStatus.confirmed ? user?.claim?.nationality : undefined);

    const assetsSerialized = assets.data.map((asset) => {
      return new AssetSerializerDto(asset);
    });

    return {
      data: assetsSerialized,
      pagination: assets.pagination,
    };
  }

  @Get('slug/:slug')
  async findOneBySlug(@Param('slug') slug: string) {
    const asset = await this.assetService.findOne({ slug });
    if (!asset) {
      throw new NotFoundException('Asset with the Given Slug is Not Found');
    }
    return new AssetSerializerDto(asset);
  }

  @Get('fraction-address/:address')
  async findOneByFractionAddress(@Param('address') address: string) {
    const asset = await this.assetService.findOne({
      nftFractionAddress: address,
    });
    if (!asset) {
      throw new NotFoundException('Asset with the Given Fraction Address is Not Found');
    }
    return new AssetSerializerDto(asset);
  }

  @Public()
  @Get('market-value/total')
  async getTotalMarketValue() {
    return await this.assetService.getTotalMarketValue();
  }
}
