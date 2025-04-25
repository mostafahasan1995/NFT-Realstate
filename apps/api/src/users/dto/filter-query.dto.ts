import { IsOptional, IsString } from 'class-validator';

export class FilterQueryDto {
  @IsOptional()
  @IsString()
  readonly roles?: string;

  @IsOptional()
  readonly isVerified?: boolean;

  @IsOptional()
  @IsString()
  readonly interested?: string;

  @IsString()
  @IsOptional()
  readonly search: string;


}
