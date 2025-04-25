import {Transform} from 'class-transformer';
import {IsEmail, IsNotEmpty} from 'class-validator';

export class SendVerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  @Transform(({value}) => value.toLowerCase())
  readonly email: string;
}
