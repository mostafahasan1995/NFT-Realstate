import { IsNotEmpty, IsString } from "class-validator";

export class ConfirmCashbackDto {
  @IsString()
  @IsNotEmpty()
  userId: string
}