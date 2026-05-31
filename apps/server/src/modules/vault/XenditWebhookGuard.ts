import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

/**
 * XenditWebhookGuard - Xendit 回调安全卫士
 * 验证 Xendit 推送的 callback-token，确保请求源自官方。
 */
@Injectable()
export class XenditWebhookGuard implements CanActivate {
  private readonly XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || 'aceproxy_test_token_2026';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['x-callback-token'];

    if (!token || token !== this.XENDIT_CALLBACK_TOKEN) {
      throw new UnauthorizedException('Invalid Xendit Callback Token');
    }

    return true;
  }
}
