import { IsEnum, IsOptional } from "class-validator";
import { FormType } from "apps/api/src/forms/enum/form-type.enum";

export class FormTypeQuery {
  @IsOptional()
  @IsEnum(FormType)
  type: FormType
}