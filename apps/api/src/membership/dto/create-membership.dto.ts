import { IsNotEmpty, IsNumber, IsString, Min } from "class-validator";
import { IMembership } from "../interfaces/membership.interface";

export class CreateMembershipDto implements IMembership {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  minPurchaseLimit: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  maxPurchaseLimit: number;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  cashback: number;

}