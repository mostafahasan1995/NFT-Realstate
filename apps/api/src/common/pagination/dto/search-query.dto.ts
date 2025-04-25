import {IsOptional, IsString} from 'class-validator';

export class SearchQueryDto {
  @IsString()
  @IsOptional()
  readonly search: string;
}
