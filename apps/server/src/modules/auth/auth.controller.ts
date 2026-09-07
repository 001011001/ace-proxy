import { Controller, Post, Get, Body, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto, LoginDto, GoogleLoginDto } from '../../dto/auth.dto';

@ApiTags('Auth — 认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '用户注册', description: '使用邮箱和密码注册新账户' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '邮箱已存在' })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password, body.phone, body.displayName);
  }

  // TODO: Add @Throttle({ default: { limit: 5, ttl: 60000 } }) after installing @nestjs/throttler
  @ApiOperation({ summary: '用户登录', description: '邮箱+密码登录，返回 JWT token' })
  @ApiResponse({ status: 200, description: '登录成功，返回 accessToken' })
  @ApiResponse({ status: 401, description: '邮箱或密码错误' })
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }

  @ApiOperation({ summary: 'Google OAuth 登录', description: '使用 Google ID Token 一键登录/注册' })
  @ApiResponse({ status: 200, description: '登录成功，返回 accessToken' })
  @ApiResponse({ status: 400, description: 'Token 验证失败' })
  @Post('google')
  async googleLogin(@Body() body: GoogleLoginDto) {
    return this.authService.googleLogin(body.credential);
  }

  /**
   * Dev-only: skip OAuth and log in as a test user.
   * Blocked in production — safe to keep in code.
   */
  @ApiOperation({ summary: '[DEV] 跳过认证直接登录', description: '开发环境使用，生产环境禁用' })
  @Post('dev-login')
  async devLogin(@Body() body: { email?: string; displayName?: string }) {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Dev login is disabled in production');
    }
    return this.authService.devLogin(body.email || 'test@aceproxy.com', body.displayName || 'Test User');
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息', description: '需要 Bearer Token' })
  @ApiResponse({ status: 200, description: '返回用户信息' })
  @ApiResponse({ status: 401, description: '未授权' })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    return this.authService.getUser(req.user.userId);
  }
}
