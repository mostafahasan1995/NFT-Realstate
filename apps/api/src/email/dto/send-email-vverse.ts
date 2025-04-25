import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class SendEmailVverseDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @IsNotEmpty()
  readonly villaNo: string;

  @IsEmail()
  @IsNotEmpty()
  readonly clientEmail: string;

  @IsEmail()
  @IsOptional()
  readonly salesmanEmail: string;

  @IsUrl()
  @IsNotEmpty()
  readonly pdfFileUrl: string;

  @IsUrl()
  @IsNotEmpty()
  readonly excelFileUrl: string;
}
