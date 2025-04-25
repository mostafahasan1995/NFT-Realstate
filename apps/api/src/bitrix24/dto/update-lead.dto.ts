import {IsOptional, IsString} from 'class-validator';

export class UpdateLeadDto {
  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  walletAddress?: string;
}
