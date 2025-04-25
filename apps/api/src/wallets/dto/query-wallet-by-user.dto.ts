import { IsMongoId, IsOptional, IsString } from "class-validator";

export class QueryWalletByUserDto {

  @IsOptional()
  @IsString()
  readonly referrerCode: string

  @IsOptional()
  @IsMongoId()
  readonly userId: string
}