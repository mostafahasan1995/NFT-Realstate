import { IsMongoId, IsOptional, IsString } from "class-validator";

export class UpdateActionDto {
  @IsString()
  @IsOptional()
  title: string;

  @IsString()
  @IsOptional()
  message: string;

  @IsMongoId()
  timelineId: string;

  @IsMongoId()
  actionId: string
}