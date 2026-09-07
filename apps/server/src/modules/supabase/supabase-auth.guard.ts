import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { SupabaseAuthService } from './supabase-auth.service';

/**
 * SupabaseAuthGuard — 验证 Supabase-issued JWT
 *
 * 与 JwtAuthGuard 并行存在：
 * - JwtAuthGuard：验证 AceProxy 自己的 JWT
 * - SupabaseAuthGuard：验证 Supabase 签发的 JWT
 *
 * 策略：从 Authorization header 提取 Bearer token，
 * 如果 token 无法被 Supabase 验证 → 抛出 401。
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

  constructor(private readonly supabaseAuth: SupabaseAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);

    try {
      const payload = await this.supabaseAuth.verifySupabaseToken(token);
      request.user = {
        userId: payload.sub,
        email: payload.email,
        role: 'USER',
        provider: payload.user_metadata?.provider || 'supabase',
      };
      return true;
    } catch (err: any) {
      this.logger.warn(`[SupabaseAuthGuard] Token rejected: ${err.message}`);
      throw new UnauthorizedException('Invalid Supabase session');
    }
  }
}
