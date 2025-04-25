import { IsJWT, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @IsJWT()
  readonly resetToken: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  readonly newPassword: string;
}
