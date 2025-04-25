import { IsMongoId, IsOptional } from "class-validator";
import { CreateActionDto } from "./create-action.dto";

export class CreateTimelineActionDto extends CreateActionDto {
  @IsMongoId()
  @IsOptional()
  assetId: string;

  @IsMongoId()
  @IsOptional()
  timelineId: string;
}