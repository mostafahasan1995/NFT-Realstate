import { IsNotEmpty, IsString } from 'class-validator';

export class RejectWithdrawCash {
  @IsString()
  @IsNotEmpty()
  readonly notes: string;
}
