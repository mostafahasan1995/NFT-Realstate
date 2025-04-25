import { IsEmail, IsOptional, IsString } from 'class-validator';

export class SearchDepositDto {
  @IsString()
  @IsOptional()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly status: string;

  @IsEmail()
  @IsOptional()
  readonly email: string;

  @IsString()
  @IsOptional()
  referenceId: string
}
