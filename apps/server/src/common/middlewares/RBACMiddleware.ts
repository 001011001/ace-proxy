import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export enum UserRole {
  GOD_MODE = 'GOD_MODE',
  FINANCIAL = 'FINANCIAL',
  STATION_MANAGER = 'STATION_MANAGER',
  WMS_OPERATOR = 'WMS_OPERATOR'
}

@Injectable()
export class RBACMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const userRole = req.headers['x-ace-role'] as UserRole;

    // 财务相关敏感路径锁定
    if (req.path.startsWith('/vault') && userRole !== UserRole.FINANCIAL && userRole !== UserRole.GOD_MODE) {
      throw new ForbiddenException('FINANCIAL_ACCESS_REQUIRED: Role does not have permission to view or edit Vault.');
    }

    // 全局站长权限路径
    if (req.path.startsWith('/station') && !userRole) {
      throw new ForbiddenException('ROLE_REQUIRED: Access denied.');
    }

    next();
  }
}
