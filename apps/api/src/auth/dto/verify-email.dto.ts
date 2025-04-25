import {IsEmail, IsNotEmpty, IsString} from 'class-validator';

export class VerifyEmailDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly code: string;
}
