import { IsEmail, IsNotEmpty, IsObject, IsString } from 'class-validator';

export class sendTemplatedEmailDto {
  @IsEmail()
  @IsNotEmpty()
  readonly to: string;

  @IsString()
  @IsNotEmpty()
  readonly templateName: string;

  @IsObject()
  @IsNotEmpty()
  readonly templateData: object;
}
