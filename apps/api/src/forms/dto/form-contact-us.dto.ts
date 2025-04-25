import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class FormContactUsDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsOptional()
  readonly message: string;

  @IsOptional()
  @IsString()
  readonly nationality: string;

  @IsOptional()
  @IsString()
  readonly residenceLocation: string;

}
