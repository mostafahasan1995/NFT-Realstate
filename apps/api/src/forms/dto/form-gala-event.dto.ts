import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class FormGalaEventDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly phoneNumber: string;

  @IsNumber()
  @IsNotEmpty()
  readonly NumberOfAttendees: number;
}
