import { Injectable, CanActivate, ExecutionContext, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

// Role hierarchy: ADMIN > FINANCIAL > STATION_MANAGER > WMS_OPERATOR > PARTNER > USER
const ROLE_WEIGHT: Record<string, number> = {
  ADMIN: 100,
  FINANCIAL: 80,
  STATION_MANAGER: 60,
  WMS_OPERATOR: 40,
  PARTNER: 20,
  USER: 0,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;

    const userLevel = ROLE_WEIGHT[user.role] ?? 0;
    return requiredRoles.some(role => userLevel >= (ROLE_WEIGHT[role] ?? 0));
  }
}
