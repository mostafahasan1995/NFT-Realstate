import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePlayerCharacterDto {
  @IsNotEmpty()
  @IsString()
  readonly playerId: string;

  @IsNotEmpty()
  @IsString()
  readonly character: string;
}
