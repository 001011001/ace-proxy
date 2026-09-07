import { Injectable, Logger, UnauthorizedException, ConflictException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

export interface SupabaseAuthResult {
  user: {
    id: string;
    email: string;
    role: string;
    displayName: string | null;
    avatar: string | null;
  };
  accessToken: string;
  expiresIn: string;
}

/**
 * SupabaseAuthService — Supabase Auth 集成层
 *
 * 替代 Google OAuth 和自定义注册/登录，
 * 使用 Supabase 内置的 Auth 服务（email/password + 社交登录）。
 *
 * 流程：
 * 1. 前端调用 supabase.auth.signUp / signInWithOAuth
 * 2. Supabase 返回 session（包含 JWT）
 * 3. 后端用该 JWT 验证身份，映射到 ace_users 表
 * 4. 返回应用层 JWT（用于后续 API 调用）
 */
@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * 通过 Supabase 用户 ID 找到或创建 AceProxy 用户
   *
   * @param supabaseUserId - supabase.auth.users 的 id（UUID）
   * @param email - 用户邮箱
   * @param metadata - 用户元数据（name, avatar_url 等）
   */
  async findOrCreateUser(
    supabaseUserId: string,
    email: string,
    metadata?: { name?: string; avatar_url?: string; provider?: string },
  ): Promise<SupabaseAuthResult> {
    // 1. 尝试通过社交账号关联查找
    const provider = metadata?.provider || 'SUPABASE';
    const existingSocial = await this.prisma.aceSocialAccount.findFirst({
      where: { provider, providerId: supabaseUserId },
      include: { user: true },
    });

    if (existingSocial) {
      await this.prisma.aceUser.update({
        where: { id: existingSocial.user.id },
        data: { lastLoginAt: new Date() },
      });
      return this.buildResult(existingSocial.user, metadata);
    }

    // 2. 通过 email 查找现有用户
    const existingUser = await this.prisma.aceUser.findUnique({ where: { email } });

    if (existingUser) {
      // Link Supabase identity to existing user
      await this.prisma.aceSocialAccount.create({
        data: {
          userId: existingUser.id,
          provider,
          providerId: supabaseUserId,
          email,
          name: metadata?.name || null,
          avatar: metadata?.avatar_url || null,
        },
      });
      await this.prisma.aceUser.update({
        where: { id: existingUser.id },
        data: {
          lastLoginAt: new Date(),
          displayName: metadata?.name || existingUser.displayName,
          avatar: metadata?.avatar_url || existingUser.avatar,
        },
      });
      return this.buildResult(existingUser, metadata);
    }

    // 3. 创建新用户
    const newUser = await this.prisma.aceUser.create({
      data: {
        email,
        displayName: metadata?.name || email.split('@')[0],
        avatar: metadata?.avatar_url || null,
      },
    });

    await this.prisma.aceSocialAccount.create({
      data: {
        userId: newUser.id,
        provider,
        providerId: supabaseUserId,
        email,
        name: metadata?.name || null,
        avatar: metadata?.avatar_url || null,
      },
    });

    this.logger.log(`[SupabaseAuth] New user created: ${email}`);
    return this.buildResult(newUser, metadata);
  }

  /**
   * 验证 Supabase 返回的 JWT access_token
   * 解析出 supabase 用户 ID 和 email
   */
  async verifySupabaseToken(accessToken: string): Promise<{
    sub: string;
    email: string;
    user_metadata?: { name?: string; avatar_url?: string; provider?: string };
  }> {
    try {
      // 使用 supabase admin client 获取用户
      const { data, error } = await this.supabase.admin.auth.getUser(accessToken);

      if (error || !data.user) {
        throw new UnauthorizedException('Invalid Supabase token');
      }

      return {
        sub: data.user.id,
        email: data.user.email || '',
        user_metadata: {
          name: data.user.user_metadata?.full_name || data.user.user_metadata?.name,
          avatar_url: data.user.user_metadata?.avatar_url,
          provider: data.user.app_metadata?.provider || 'email',
        },
      };
    } catch (err: any) {
      if (err instanceof UnauthorizedException) throw err;
      this.logger.error(`[SupabaseAuth] Token verification failed: ${err.message}`);
      throw new UnauthorizedException('Failed to verify Supabase session');
    }
  }

  /**
   * 完整登录流程：验证 Supabase token → 映射到 AceProxy 用户 → 返回应用 JWT
   */
  async authenticateWithSupabase(supabaseAccessToken: string): Promise<SupabaseAuthResult> {
    const payload = await this.verifySupabaseToken(supabaseAccessToken);
    return this.findOrCreateUser(payload.sub, payload.email, payload.user_metadata);
  }

  /**
   * 构建返回结果
   */
  private buildResult(
    user: { id: string; email: string; role: string; displayName: string | null; avatar: string | null },
    metadata?: { name?: string; avatar_url?: string },
  ): SupabaseAuthResult {
    const jwtPayload = { sub: user.id, email: user.email, role: user.role };
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        displayName: metadata?.name || user.displayName,
        avatar: metadata?.avatar_url || user.avatar,
      },
      accessToken: this.jwtService.sign(jwtPayload),
      expiresIn: '7d',
    };
  }
}
