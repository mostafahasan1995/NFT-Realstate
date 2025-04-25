import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  BadRequestException,
  Put,
  Get,
  Query,
} from '@nestjs/common';

import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guard/roles.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AssetService } from './asset.service';
import { Asset } from './schemas/asset.schema';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { Role } from '../auth/enums/role.enum';
import { DocsDto } from './dto/docs.dto';
import { MarketValueDocsDto } from './dto/market-value.dto';
import { PaginationQueryDto } from '../common/pagination/dto/pagination-query.dto';
import { FilterQueryDto } from './dto/filter-query.dto';
import { FindAssetPaginationDto } from './dto/find-asset-pagination.dto';
import { UpdateAssetDocDto } from './dto/asset-docs.dto';

@Roles(Role.Admin)
@UseGuards(RolesGuard)
@ApiBearerAuth()
@ApiTags('admin/assets')
@Controller('admin/assets')
export class AdminAssetController {
  constructor(private readonly assetService: AssetService) { }

  @Get()
  async findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
    @Query() filterDto: FilterQueryDto
  ): Promise<FindAssetPaginationDto> {
    return await this.assetService.findAll(paginationQueryDto, filterDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const asset = await this.assetService.findOne({ _id: id });
    if (!asset) {
      throw new NotFoundException('Asset with the Given ID is Not Found');
    }
    return asset;
  }

  @Post()
  async create(@Body() createAssetDto: CreateAssetDto): Promise<Asset> {
    return await this.assetService.createAsset(createAssetDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAssetDto: UpdateAssetDto
  ): Promise<Asset> {
    return await this.assetService.updateData(id, updateAssetDto);
  }

  @Put(':assetId/docs')
  async AddDocs(@Param('assetId') assetId: string, @Body() docsDto: DocsDto) {
    const asset = await this.assetService.findOne({ _id: assetId });
    if (!asset) {
      throw new BadRequestException(`Asset not found`);
    }

    const updatedAsset = await this.assetService.updateDocs(assetId, docsDto);

    return updatedAsset;
  }

  @Put(':assetId/asset-doc')
  async AddAssetDocs(@Param('assetId') assetId: string, @Body() updateAssetDocDto: UpdateAssetDocDto) {
    const asset = await this.assetService.findOne({ _id: assetId });
    if (!asset) {
      throw new BadRequestException(`Asset not found`);
    }

    const updatedAsset = await this.assetService.updateAssetDocs(asset, updateAssetDocDto);

    return updatedAsset;
  }

  @Put(':assetId/income-docs')
  async AddIncomeDoc(
    @Param('assetId') assetId: string,
    @Body() docsDto: DocsDto
  ) {
    const asset = await this.assetService.findOne({ _id: assetId });
    if (!asset) {
      throw new BadRequestException(`Asset not found`);
    }

    // Update the asset
    const updatedAsset = await this.assetService.updateIncomeDocs(
      assetId,
      docsDto
    );
    return updatedAsset;
  }

  @Put(':assetId/market-value-docs')
  async AddMarketValueDoc(
    @Param('assetId') assetId: string,
    @Body() marketValueDocsDto: MarketValueDocsDto
  ) {
    const asset = await this.assetService.findOne({ _id: assetId });
    if (!asset) {
      throw new BadRequestException(`Asset not found`);
    }

    // Update asset
    return await this.assetService.updateMarketValueWithDocs(
      assetId,
      marketValueDocsDto
    );
  }

  @Post(':id/reset-deployment')
  async resetAssetDeployData(@Param('id') id: string): Promise<Asset> {
    const asset = await this.assetService.findOne({ _id: id });
    if (!asset) {
      throw new BadRequestException(`Asset not found`);
    }

    // Update the asset
    await this.assetService.resetAssetDeployData(id);

    const updatedAsset = await this.assetService.findOne({ _id: id });
    return updatedAsset;
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Asset> {
    const asset = await this.assetService.findOne({ _id: id });
    if (!asset) {
      throw new BadRequestException(`Asset not found`);
    }

    // Prevent deleting deployed asset
    if (asset.deployed) {
      throw new BadRequestException('Cannot delete deployed asset');
    }

    // Delete the asset
    const deletedAsset = await this.assetService.delete(id);

    return deletedAsset;
  }
}
