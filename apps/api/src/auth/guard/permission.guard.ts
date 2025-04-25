import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permission.decorator';
import { Permissions } from '../enums/permission.enum';
import { Action } from '../enums/action.enum';
import { IUser } from '../../users/interfaces/user.interface';
import { Role } from '../enums/role.enum';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions: { permission: Permissions, actions: Action[] } = this.reflector.getAllAndOverride(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user }: { user: IUser } = context.switchToHttp().getRequest();

    const isAdminWithFullAccess = user.isAdmin && user.roles.includes(Role.Admin)
      && user?.permissions[Permissions.fullAccess]?.includes(Action.full)

    if (isAdminWithFullAccess) return true

    if (!requiredPermissions) return false;

    const { permission, actions } = requiredPermissions;

    if (!user?.permissions)
      throw new ForbiddenException('You do not have any permission');

    const userPermissions = user.permissions[permission] || [];
    const hasPermission = actions.every((action) => userPermissions.includes(action)) || userPermissions.includes(Action.full);

    if (!hasPermission)
      throw new ForbiddenException('You do not have permission to perform this action');

    return true;
  }
}
