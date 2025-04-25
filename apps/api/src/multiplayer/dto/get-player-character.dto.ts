import { IsNotEmpty, IsString } from 'class-validator';

export class GetPlayerCharacterDto {
  @IsNotEmpty()
  @IsString()
  readonly playerId: string;
}
