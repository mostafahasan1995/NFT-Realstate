import {Pagination} from '../../common/pagination/interfaces/pagination.interface';
import {Asset} from '../schemas/asset.schema';

export class FindAssetPaginationDto {
  readonly data: Asset[];
  readonly pagination: Pagination;
}
