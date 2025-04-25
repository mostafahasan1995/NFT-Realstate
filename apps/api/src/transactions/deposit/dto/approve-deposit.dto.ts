import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ApproveDepositDto {
  @IsString()
  @IsNotEmpty()
  readonly hashAddress: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  readonly gusdAmount: number;

  @IsString()
  @IsOptional()
  readonly notes: string;
}
