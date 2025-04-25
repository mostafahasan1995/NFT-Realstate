import { IsString, IsUrl } from 'class-validator';

export class CreateURLFileDto {
  @IsString()
  name: string

  @IsUrl()
  url: string
}