import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

export class QueryTimelineDto {
  @Type(() => String)
  @IsString()
  @IsOptional()
  assetId: string;

  @Type(() => String)
  @IsString()
  @IsOptional()
  timelineId: string;
}