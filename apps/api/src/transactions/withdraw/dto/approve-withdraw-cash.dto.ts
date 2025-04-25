import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class ApproveWithdrawCash {
  @IsNumber()
  @IsOptional()
  readonly sentAmount: number;

  @IsMongoId()
  @IsNotEmpty()
  readonly invoice: string;

  @IsString()
  @IsOptional()
  readonly notes: string;
}
