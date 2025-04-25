import { IsEnum, IsNotEmpty, IsString } from "class-validator";
import { Permissions } from "../../auth/enums/permission.enum";
import { Action } from "../../auth/enums/action.enum";

export class UpdateUserPermissionsDto {
  @IsEnum(Permissions)
  @IsString()
  permissionKey: Permissions;

  @IsNotEmpty()
  @IsEnum(Action, { each: true })
  actions: Action[];
}