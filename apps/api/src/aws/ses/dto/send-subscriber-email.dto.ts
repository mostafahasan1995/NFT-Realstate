import { IsEmail, IsNotEmpty } from "class-validator";

export class SendSubscriberEmailDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string
}