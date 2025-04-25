import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class BurnTokensDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  readonly amount: number;
}
