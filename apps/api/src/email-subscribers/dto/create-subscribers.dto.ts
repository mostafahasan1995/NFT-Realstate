import { IsEmail } from "class-validator";

export class CreateSubscribersDto {
  @IsEmail()
  email: string
}