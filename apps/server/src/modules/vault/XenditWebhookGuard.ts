import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ServiceUnavailableException } from '@nestjs/common';

/**
 * XenditWebhookGuard - Xendit 回调安全卫士
 * 验证 Xendit 推送的 callback-token，确保请求源自官方。
 */
@Injectable()
export class XenditWebhookGuard implements CanActivate {
  private readonly XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN;

  canActivate(context: ExecutionContext): boolean {
    if (!this.XENDIT_CALLBACK_TOKEN) {
      throw new ServiceUnavailableException('XENDIT_CALLBACK_TOKEN not configured');
    }

    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-callback-token'];

    if (!token || token !== this.XENDIT_CALLBACK_TOKEN) {
      throw new UnauthorizedException('Invalid Xendit Callback Token');
    }

    return true;
  }
}
