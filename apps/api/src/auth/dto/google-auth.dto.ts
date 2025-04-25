import {IsNotEmpty, IsOptional, IsString} from 'class-validator';

export class GoogleAuthDto {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @IsString()
  @IsOptional()
  readonly referrerCode: string;

  @IsString()
  @IsOptional()
  readonly phoneNumber: string;
}
