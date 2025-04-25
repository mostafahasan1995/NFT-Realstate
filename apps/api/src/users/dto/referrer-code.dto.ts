import { IsNotEmpty, IsString } from 'class-validator';

export class ReferrerCodeDto {
  @IsString()
  @IsNotEmpty()
  readonly referrerCode: string;
}
