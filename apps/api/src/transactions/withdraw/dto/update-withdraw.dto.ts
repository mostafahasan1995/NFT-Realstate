import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateWithdrawDto {
  @IsString()
  @IsNotEmpty()
  readonly notes: string;
}
