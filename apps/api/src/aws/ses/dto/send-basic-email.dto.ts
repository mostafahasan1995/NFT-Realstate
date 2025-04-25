import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendBasicEmailDto {
  @IsEmail()
  @IsNotEmpty()
  readonly to: string;

  @IsString()
  @IsNotEmpty()
  readonly subject: string;

  @IsString()
  @IsNotEmpty()
  readonly text: string;
}
