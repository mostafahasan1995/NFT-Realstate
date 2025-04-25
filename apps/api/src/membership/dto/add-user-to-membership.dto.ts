import { IsNotEmpty, IsString } from "class-validator";

export class AddUserToMembershipDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  membershipId: string;
}