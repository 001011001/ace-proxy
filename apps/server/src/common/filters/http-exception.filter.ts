import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 统一 API 响应结构
 *
 * 原从 `@ace-proxy/shared` 引入，但该 workspace 包未安装到 node_modules，
 * 编译产物 require 时会 MODULE_NOT_FOUND 导致服务无法启动。此处内联定义。
 */
interface ApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

/**
 * 业务错误码 —— 与 packages/shared/src/types/api-response.ts 保持一致
 */
const ERROR_CODES = {
  SUCCESS: 0,
  VALIDATION_ERROR: 1001,
  UNAUTHORIZED: 1002,
  FORBIDDEN: 1003,
  NOT_FOUND: 1004,
  CONFLICT: 1005,
  RATE_LIMITED: 1006,
  INTERNAL_ERROR: 5000,
} as const;

/**
 * 全局 HTTP 异常过滤器
 * 
 * 将所有异常统一包装为 ApiResponse 格式
 * 包含请求日志，方便排查问题
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let code: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();
      message = typeof exResponse === 'string' ? exResponse : (exResponse as any).message || exception.message;

      // 映射 HTTP 状态码到业务错误码
      switch (status) {
        case 400: code = ERROR_CODES.VALIDATION_ERROR; break;
        case 401: code = ERROR_CODES.UNAUTHORIZED; break;
        case 403: code = ERROR_CODES.FORBIDDEN; break;
        case 404: code = ERROR_CODES.NOT_FOUND; break;
        case 409: code = ERROR_CODES.CONFLICT; break;
        case 429: code = ERROR_CODES.RATE_LIMITED; break;
        default: code = status;
      }

      // class-validator 错误信息格式化
      if (Array.isArray(message)) {
        message = message.join('; ');
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      code = ERROR_CODES.INTERNAL_ERROR;
      message = 'Internal server error';
      this.logger.error(`Unhandled exception: ${exception}`, (exception as any)?.stack);
    }

    const errorResponse: ApiResponse<null> = {
      code,
      message: typeof message === 'string' ? message : 'Unknown error',
      data: null,
      timestamp: new Date().toISOString(),
    };

    // 记录非 4xx 错误
    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json(errorResponse);
  }
}
