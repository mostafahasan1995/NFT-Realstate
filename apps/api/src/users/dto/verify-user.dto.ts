import { IsMongoId, IsString, IsUrl } from "class-validator"

export class VerifyUserDto {
  @IsString()
  nationality: string

  @IsUrl()
  idCardImage: string

  @IsUrl()
  idbackCardImage: string

  @IsString()
  residence: string

  @IsUrl()
  photoCamera: string
}