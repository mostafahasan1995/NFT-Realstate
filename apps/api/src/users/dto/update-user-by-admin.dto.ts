import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserByAdminDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  readonly name?: string;

  @IsBoolean()
  @IsOptional()
  readonly isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly isAdmin?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly kycStatus?: boolean
}
