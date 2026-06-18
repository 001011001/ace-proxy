import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RegisterDto, LoginDto } from '../../dto/auth.dto';

@ApiTags('Auth — 认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: '用户注册', description: '使用邮箱和密码注册新账户' })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 409, description: '邮箱已存在' })
  @Post('register')
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body.email, body.password);
  }

  // TODO: Add @Throttle({ default: { limit: 5, ttl: 60000 } }) after installing @nestjs/throttler
  @ApiOperation({ summary: '用户登录', description: '邮箱+密码登录，返回 JWT token' })
  @ApiResponse({ status: 200, description: '登录成功，返回 accessToken' })
  @ApiResponse({ status: 401, description: '邮箱或密码错误' })
  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
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
