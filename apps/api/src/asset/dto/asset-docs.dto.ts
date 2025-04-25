import { IsArray, IsEnum, IsMongoId, IsNotEmpty } from "class-validator";
import { DocType } from "../enums/doc-type.enum";
import { Types } from "mongoose";

export class UpdateAssetDocDto {
  @IsNotEmpty()
  @IsEnum(DocType)
  type: number;

  @IsMongoId({ each: true })
  @IsArray()
  docs: string[];

}