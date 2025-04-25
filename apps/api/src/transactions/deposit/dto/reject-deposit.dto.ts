import { IsOptional, IsString } from 'class-validator';

export class RejectDepositDto {
  @IsString()
  @IsOptional()
  readonly notes: string;
}
