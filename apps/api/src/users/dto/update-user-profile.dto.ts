import { IsOptional, IsString, IsUrl, MinLength } from 'class-validator';

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly phoneNumber: string;

  @IsOptional()
  @IsUrl()
  readonly avatar: string;
}
