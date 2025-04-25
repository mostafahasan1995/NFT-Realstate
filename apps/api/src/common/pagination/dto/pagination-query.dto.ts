import {IsEnum, IsOptional, IsString} from 'class-validator';
import {Transform} from 'class-transformer';

enum PaginationStatus {
  none = 'none',
}

enum SortEnum {
  asc = 'asc',
  desc = 'desc',
}

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({value}) => parseInt(value))
  readonly page: number = 1;

  @IsOptional()
  @Transform(({value}) => parseInt(value))
  readonly pageSize: number = 10;

  @IsString()
  @IsEnum(SortEnum)
  @IsOptional()
  readonly sortOrder: string;

  @IsString()
  @IsEnum(PaginationStatus)
  @IsOptional()
  readonly pagination: string;
}
