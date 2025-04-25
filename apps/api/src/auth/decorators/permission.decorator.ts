import { SetMetadata } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { Action } from '../enums/action.enum';
import { Permissions } from '../enums/permission.enum';

export const PERMISSIONS_KEY = 'permissions';
export const Permission = (permission: Permissions, actions: Action[]) => SetMetadata(PERMISSIONS_KEY, { permission, actions });
