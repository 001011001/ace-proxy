import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

/**
 * ThrottlerGuard — 接口限流
 * 保护注册/登录/支付等高危接口
 * 429 响应携带标准限流头：
 *   Retry-After, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
 */
@Injectable()
export class ThrottlerGuard implements CanActivate {
  private readonly store = new Map<string, RateLimitEntry>();
  private readonly LIMITS: Record<string, { max: number; windowMs: number }> = {
    '/auth/register': { max: 5, windowMs: 60_000 },     // 5次/分钟
    '/auth/login': { max: 10, windowMs: 60_000 },        // 10次/分钟
    '/payment/create-invoice': { max: 20, windowMs: 60_000 },
    '/trade/order': { max: 30, windowMs: 60_000 },
    '/smart-collect/search': { max: 30, windowMs: 60_000 },
    '/arbibot/analyze': { max: 20, windowMs: 60_000 },
  };

  private readonly DEFAULT: { max: number; windowMs: number } = { max: 100, windowMs: 60_000 };

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const key = `${request.ip}:${request.route?.path || request.url}`;

    // 匹配限流规则
    const limit = this.LIMITS[request.route?.path || ''] || this.DEFAULT;
    const now = Date.now();

    let entry = this.store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + limit.windowMs };
      this.store.set(key, entry);
      this.setRateLimitHeaders(response, limit.max, limit.max - entry.count, entry.resetAt);
      return true;
    }

    if (entry.count >= limit.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      this.setRateLimitHeaders(response, limit.max, 0, entry.resetAt);
      response.header('Retry-After', String(retryAfter));
      throw new HttpException(
        `Too many requests. Retry after ${retryAfter}s`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    entry.count++;
    this.setRateLimitHeaders(response, limit.max, limit.max - entry.count, entry.resetAt);
    return true;
  }

  /** 在响应中设置标准限流头信息 */
  private setRateLimitHeaders(
    response: any,
    limit: number,
    remaining: number,
    resetAt: number,
  ): void {
    try {
      response.header('X-RateLimit-Limit', String(limit));
      response.header('X-RateLimit-Remaining', String(Math.max(0, remaining)));
      response.header('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));
    } catch {
      // 某些执行上下文中可能无法访问 response，忽略
    }
  }

  /** 定期清理过期条目（CronJob 调用） */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store) {
      if (now > entry.resetAt) this.store.delete(key);
    }
  }
}
