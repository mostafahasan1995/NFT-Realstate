import {Injectable} from '@nestjs/common';
import {Asset} from './schemas/asset.schema';
import {BaseRepository} from '../common/base.repository';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {PaginationQueryDto} from '../common/pagination/dto/pagination-query.dto';
import {FilterQuery} from '../common/pagination/interfaces/filter-query.interface';
import {SearchQuery} from '../common/pagination/interfaces/search-query.interface';

@Injectable()
export class AssetRepository extends BaseRepository<Asset> {
  constructor(
    @InjectModel(Asset.name)
    private readonly assetModel: Model<Asset>
  ) {
    super(assetModel);
  }

  async findWithPagination(
    paginationQueryDto: PaginationQueryDto,
    filterQuery: FilterQuery = {},
    searchQuery: SearchQuery = {}
  ) {
    const {page, pageSize, pagination} = paginationQueryDto;

    // Pagination skip calculation
    const skip = pagination ? 0 : (page - 1) * pageSize;

    // Create an empty filter object with dynamic properties.
    const filter: Record<string, unknown> = {};

    // Iterate over the properties of filterQueryDto
    for (const [key, value] of Object.entries(filterQuery)) {
      if (value !== undefined) {
        // For properties, add them directly to the filter
        filter[key] = value;
      }
    }

    // Create an empty search object with dynamic properties.
    const search: Record<string, unknown> = {};

    // Iterate over the properties of searchQueryDto
    for (const [key, value] of Object.entries(searchQuery)) {
      if (value !== undefined) {
        // For each property, create a regex query
        search[key] = {$regex: value, $options: 'i'};
      }
    }

    // If the search object is not empty, add it to the filter
    if (Object.keys(search).length > 0) {
      filter.$or = Object.entries(search).map(([key, value]) => ({
        [key]: value,
      }));
    }

    // Execute the aggregation pipeline
    const aggregation = await this.model
      .aggregate([
        {$match: filter},
        {
          $addFields: {
            sortWeight: {
              $switch: {
                branches: [
                  {case: {$eq: ['$status', 'active']}, then: 1},
                  {case: {$eq: ['$status', 'sold']}, then: 2},
                  {case: {$eq: ['$status', 'coming_soon']}, then: 3},
                  {case: {$eq: ['$status', 'failed']}, then: 4},
                ],
                default: 5, // Handle any unexpected status
              },
            },
          },
        },
        {$sort: {sortWeight: 1}},
        {$skip: skip},
        {$limit: pageSize},
        {$project: {_id: 1, sortWeight: 1}},
      ])
      .exec();

    // Map IDs and weights for sorting
    const ids = aggregation.map((item) => item._id);
    const sortWeights = aggregation.reduce((acc, item) => {
      acc[item._id] = item.sortWeight;
      return acc;
    }, {});

    // Retrieve and populate documents
    const data = await this.model
      .find({
        _id: {$in: ids},
      })
      .populate([
        {path: 'assetBlueprintImage'},
        {path: 'images'},
        {path: 'docs'},
        {path: 'incomeDocs'},
        {path: 'marketValueDocs'},
        {path: 'marketValueLogs'},
      ])
      .exec();

    // Sort documents manually based on the sortWeights
    data.sort(
      (a, b) => sortWeights[a._id.toString()] - sortWeights[b._id.toString()]
    );

    const totalRecords = await this.model.countDocuments(filter);
    const pageRecords = data.length;

    const currentPage = page;
    const totalPages = Math.ceil(totalRecords / pageSize);

    return {
      data,
      pagination: {
        pageSize,
        pageRecords,
        currentPage,
        totalRecords,
        totalPages,
      },
    };
  }
}
