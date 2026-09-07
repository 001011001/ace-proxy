import { Controller, Post, Body, Logger, Get, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SupabaseAuthService } from './supabase-auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Auth — Supabase')
@Controller('auth/supabase')
export class SupabaseAuthController {
  private readonly logger = new Logger(SupabaseAuthController.name);

  constructor(private readonly supabaseAuth: SupabaseAuthService) {}

  /**
   * 前端注册/登录后，将 Supabase session token 发送到后端换取应用 JWT。
   *
   * 前端流程：
   * 1. 调用 supabase.auth.signUp / signInWithPassword / signInWithOAuth
   * 2. 获取 session.access_token
   * 3. 调用此端点 POST /auth/supabase/exchange
   * 4. 获取 AceProxy JWT，存入 localStorage.aceproxy_token
   *
   * 支持：
   * - Email + Password 注册/登录
   * - Google / GitHub / 等 OAuth 社交登录
   * - Magic Link 无密码登录
   */
  @ApiOperation({
    summary: '交换 Supabase Session Token → AceProxy JWT',
    description:
      '前端用 Supabase Auth 登录后，将 session.access_token 发送到此端点，换取应用层 JWT',
  })
  @ApiResponse({ status: 200, description: '登录成功，返回 AceProxy JWT' })
  @ApiResponse({ status: 401, description: 'Supabase token 无效或过期' })
  @Post('exchange')
  async exchangeToken(@Body() body: { accessToken: string }) {
    this.logger.log('[SupabaseAuth] Token exchange requested');
    return this.supabaseAuth.authenticateWithSupabase(body.accessToken);
  }

  /**
   * 健康检查 — 确认 Supabase Auth 是否已配置
   */
  @ApiOperation({ summary: '检查 Supabase Auth 配置状态' })
  @Get('status')
  getStatus() {
    return {
      provider: 'Supabase Auth',
      mode: process.env.SUPABASE_URL ? 'configured' : 'not-configured',
      features: ['email/password', 'Google OAuth', 'Magic Link', 'OTP'],
    };
  }
}
