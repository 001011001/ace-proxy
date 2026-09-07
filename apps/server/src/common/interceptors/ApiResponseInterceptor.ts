import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

/**
 * 统一 API 响应结构
 *
 * 原从 `@ace-proxy/shared` 引入，但该 workspace 包未安装到 node_modules，
 * 导致编译产物 require 失败（MODULE_NOT_FOUND），服务无法启动。
 * 此处内联定义，既解决启动问题，也让本文件对外零 workspace 依赖。
 */
export interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/** 业务错误码（与前端约定：0 = 成功） */
const ERROR_CODES = { SUCCESS: 0 } as const;

/**
 * 统一 API 响应拦截器
 * 
 * 将所有成功响应包装为 { code: 0, message: "success", data: T, timestamp: ISO }
 * 与 @ace-proxy/shared 类型包完全对齐
 */
@Injectable()
export class ApiResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    // 安全响应头在此统一写入：
    // 曾尝试「独立全局拦截器」与「Express 中间件」两种方式，均因注册时机
    // 问题未被执行（实测安全头不出现在响应中）。本拦截器已验证对所有请求生效，
    // 故将安全头逻辑并入，确保必定写入。
    this.applySecurityHeaders(context);

    return next.handle().pipe(
      map((data) => {
        return {
          code: ERROR_CODES.SUCCESS,
          message: 'success',
          data,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  /**
   * 写入安全响应头（零依赖，等效 helmet 核心策略）
   * - nosniff        防 MIME 嗅探
   * - DENY           防点击劫持（禁止被 iframe 嵌套）
   * - Referrer-Policy 控制 Referer 泄露
   * - HSTS           仅生产环境强制 HTTPS
   */
  private applySecurityHeaders(context: ExecutionContext): void {
    try {
      const res = context.switchToHttp().getResponse();
      if (!res || typeof res.setHeader !== 'function') return;

      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('X-XSS-Protection', '0');
      res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

      // 本地开发不加 HSTS，避免浏览器缓存后影响 http 调试
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
      }

      // 隐藏 Express 技术栈指纹
      res.removeHeader('X-Powered-By');
    } catch {
      // 非 HTTP 上下文（RPC/WS）无响应头概念，静默跳过
    }
  }
}
