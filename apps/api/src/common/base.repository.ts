import {Injectable} from '@nestjs/common';
import {FilterQuery as MongooseFilterQuery, Model} from 'mongoose';
import {PaginationQueryDto} from './pagination/dto/pagination-query.dto';
import {SearchQuery} from './pagination/interfaces/search-query.interface';
import {FilterQuery} from './pagination/interfaces/filter-query.interface';
import {SortQuery} from './pagination/interfaces/sort-query.interface';

@Injectable()
export abstract class BaseRepository<T> {
  constructor(public readonly model: Model<T>) {}

  async find(filter?: MongooseFilterQuery<T>): Promise<T[]> {
    return await this.model.find(filter).sort({_id: -1}).exec();
  }

  async findOne(filter: MongooseFilterQuery<T>): Promise<T | null> {
    return await this.model.findOne(filter).exec();
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async update(
    filter: MongooseFilterQuery<T>,
    updateData: Partial<T>
  ): Promise<T | null> {
    return await this.model
      .findOneAndUpdate(filter, updateData, {new: true})
      .exec();
  }

  async delete(filter: MongooseFilterQuery<T>): Promise<T> {
    const result = await this.model.findOneAndDelete(filter).exec();
    if (!result) return result as T;
  }

  async findWithPagination(
    paginationQueryDto: PaginationQueryDto,
    filterQuery: FilterQuery = {},
    searchQuery: SearchQuery = {},
    sortQuery: SortQuery = {},
    sortFields: string[] = ['_id']
  ) {
    const {page, pageSize, sortOrder, pagination} = paginationQueryDto;

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

    const query = this.model.find(filter);

    // Create a sort object based on the sortFields array
    const sortObject = sortFields.reduce((obj, field) => {
      obj[field] = sortOrder === 'asc' ? 1 : -1;
      return obj;
    }, {});

    // Merge the sortObject with the sortQueries object
    const finalSortObject = {...sortObject, ...sortQuery};

    query.sort(finalSortObject);
    query.skip(skip).limit(+pageSize);

    const data = await query.exec();

    // Count documents
    const totalRecords = (await this.model.find(filter)).length;
    const pageRecords = await data.length;

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
