import { IsOptional, IsString } from "class-validator";

export class ConfirmCommissionDto {
  @IsString()
  @IsOptional()
  userId: string


  @IsString()
  @IsOptional()
  referrerCode: string
}