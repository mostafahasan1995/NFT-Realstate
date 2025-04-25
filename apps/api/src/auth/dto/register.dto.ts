import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly username: string;

  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  readonly email: string;


  @IsOptional()
  @IsString()
  readonly phoneNumber: string;


  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly password: string;

  @IsOptional()
  @IsString()
  readonly referrerCode: string;
}
