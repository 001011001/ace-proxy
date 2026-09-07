import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * SecurityHeadersInterceptor — 安全响应头（零依赖，等效 helmet 核心策略）
 *
 * 为什么用拦截器而非 Express 中间件：
 * 底层 Express 中间件的注册时机受 Nest 初始化顺序影响，实测安全头不会出现在响应中；
 * 拦截器运行在 Nest 请求生命周期内，必然在响应写出前执行，行为可靠。
 *
 * 覆盖的防护：
 * - X-Content-Type-Options: nosniff  防 MIME 嗅探
 * - X-Frame-Options: DENY            防点击劫持（禁止被 iframe 嵌套）
 * - Referrer-Policy                  控制 Referer 泄露
 * - Permissions-Policy               禁用不必要的浏览器能力
 * - Strict-Transport-Security        生产强制 HTTPS
 * - 移除 X-Powered-By                隐藏 Express 技术栈指纹
 */
@Injectable()
export class SecurityHeadersInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SecurityHeadersInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // 不依赖 context.getType() 判断：该取值在不同适配器下可能非 'http'，
    // 一旦判断不成立就会导致安全头被整体跳过。改为直接尝试取响应对象，
    // 非 HTTP 上下文（RPC/WS）取不到时由 catch 静默跳过。
    try {
      const res = context.switchToHttp().getResponse();
      this.logger.log(
        `[SecurityHeaders] called; ctxType=${context.getType()}; res=${!!res}; hasSetHeader=${typeof res?.setHeader}`,
      );
      if (res && typeof res.setHeader === 'function') {
        const isProd = process.env.NODE_ENV === 'production';

        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'DENY');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        res.setHeader('X-XSS-Protection', '0');
        res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // 生产环境强制 HTTPS；本地开发不加，避免浏览器缓存 HSTS 影响调试
        if (isProd) {
          res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }

        // 隐藏 Express 指纹，降低被针对性攻击的暴露面
        res.removeHeader('X-Powered-By');
      }
    } catch (e) {
      // 非 HTTP 上下文或无响应对象 —— 无需设置安全头，且不阻断业务
      this.logger.debug(`[SecurityHeaders] skipped: ${(e as Error).message}`);
    }

    return next.handle();
  }
}
