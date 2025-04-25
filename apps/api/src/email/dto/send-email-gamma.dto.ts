import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class SendEmailGammaDto {
  @IsString()
  @IsNotEmpty()
  readonly name: string;

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
