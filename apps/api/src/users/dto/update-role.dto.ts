import { IsArray, IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserRoleDto {
  @IsArray()
  @IsOptional()
  readonly roles?: string[];

  @IsBoolean()
  @IsOptional()
  readonly isAdmin?: boolean;
}
