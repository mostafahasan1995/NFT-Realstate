import { IsDecimal, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { IMembership } from "../interfaces/membership.interface";

export class UpdateMembershipDto implements IMembership {
  @IsString()
  @IsOptional()
  name: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  minPurchaseLimit: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxPurchaseLimit: number;

  @Min(0)
  @Max(1)
  @IsOptional()
  cashback: number;

}