import { TimelineInterface } from "../interface/timeline.interface";
import { IsArray, IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import { CreateActionDto } from "./create-action.dto";

export class CreateTimelineDto implements TimelineInterface {
  @IsMongoId()
  @IsNotEmpty()
  asset: string;

  @IsOptional()
  @IsArray()
  actions: CreateActionDto[];

}