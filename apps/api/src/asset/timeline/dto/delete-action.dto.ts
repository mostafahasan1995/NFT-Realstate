import { IsMongoId } from "class-validator";

export class DeleteActionDto {
  @IsMongoId()
  timelineId: string;

  @IsMongoId()
  actionId: string
}