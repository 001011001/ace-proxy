import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export enum UserRole {
  ADMIN = 'ADMIN',
  FINANCIAL = 'FINANCIAL',
  STATION_MANAGER = 'STATION_MANAGER',
  WMS_OPERATOR = 'WMS_OPERATOR',
  USER = 'USER',
}

@Injectable()
export class RBACMiddleware implements NestMiddleware {
  use(req: Request & { user?: { role?: string } }, res: Response, next: NextFunction) {
    // 从 JWT 认证后的 req.user 读取角色（由 JwtStrategy.validate 设置）
    // 未认证用户交给 JwtAuthGuard 处理，RBAC 只做已认证用户的角色校验
    const userRole = req.user?.role as UserRole;
    if (!userRole) {
      return next();
    }

    // 财务相关敏感路径锁定
    if (req.path.startsWith('/api/v1/vault') && userRole !== UserRole.FINANCIAL && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('FINANCIAL_ACCESS_REQUIRED: Role does not have permission to view or edit Vault.');
    }

    // 站长权限路径
    if (req.path.startsWith('/api/v1/station') && userRole !== UserRole.STATION_MANAGER && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException('STATION_ACCESS_REQUIRED: Insufficient permissions.');
    }

    next();
  }
}
