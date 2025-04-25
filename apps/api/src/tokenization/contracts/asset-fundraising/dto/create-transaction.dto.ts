import { IsNotEmpty, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  readonly assetId: string;

  @IsString()
  @IsNotEmpty()
  readonly transactionAddress: string;
}
