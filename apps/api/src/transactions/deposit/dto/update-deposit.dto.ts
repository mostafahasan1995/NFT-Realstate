import { IsOptional, IsString } from 'class-validator';

export class UpdateDepositDto {
  @IsString()
  @IsOptional()
  readonly notes: string;
}
