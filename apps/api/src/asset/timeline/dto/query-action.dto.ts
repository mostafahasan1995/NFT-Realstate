import { IsNotEmpty, IsString } from "class-validator";

export class QueryActionDto {
  @IsString()
  @IsNotEmpty()
  actionId: string

  @IsString()
  @IsNotEmpty()
  timelineId: string
}