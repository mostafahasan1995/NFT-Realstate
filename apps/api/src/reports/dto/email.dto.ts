import { IsEmail, IsOptional } from "class-validator";

export class EmailDto {
  @IsEmail()
  @IsOptional()
  email: string
}