import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiResponseInterceptor } from './common/interceptors/ApiResponseInterceptor';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { ThrottlerGuard } from './common/guards/ThrottlerGuard';

/**
 * 启动期校验必需环境变量 —— fail fast
 *
 * 避免两种隐患：
 * 1. 密钥缺失时服务"看似启动成功"，却到签发/校验 token 时才崩溃；
 * 2. JWT 策略以 undefined 密钥初始化 → 验签行为不可控 → 鉴权被绕过。
 */
function assertRequiredEnv(): void {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((k) => {
    const v = process.env[k];
    return !v || v.trim() === '' || v.includes('your-');
  });
  if (missing.length > 0) {
    throw new Error(
      `Missing or placeholder env vars: ${missing.join(', ')}. Check apps/server/.env before starting.`,
    );
  }
}

async function bootstrap() {
  assertRequiredEnv();

  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // ─── CORS ────────────────────────────────────────────────────
  const prodWhitelist = [
    'https://aceproxy.id',
    'https://www.aceproxy.id',
    'https://aceproxy.co.th',
    'https://aceproxy.ph',
    'https://admin.aceproxy.id',
    'https://app.codebuddy.work',
  ];
  const isDev = process.env.NODE_ENV !== 'production';

  const devWhitelist = [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://127.0.0.1:3000',
    // 消费者网页端（apps/web-storefront，Vite 默认端口）
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://d019ff30096a420ca632cabf74b4c5f6.app.codebuddy.work',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (isDev) {
        if (!origin || origin === 'null') { callback(null, true); return; }
        const allowed = devWhitelist.some(h => origin === h);
        if (!allowed) logger.warn(`[CORS][DEV] Blocked origin: ${origin}`);
        callback(null, allowed);
      } else {
        const allowed = !origin || prodWhitelist.some(h => origin === h || origin.startsWith(h + '/'));
        if (!allowed) logger.warn(`[CORS] Blocked origin: ${origin}`);
        callback(null, allowed);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Country', 'X-Callback-Token', 'Idempotency-Key'],
  });

  // ─── 安全响应头 ──────────────────────────────────────────────
  // 通过全局拦截器实现（见 SecurityHeadersInterceptor）：
  // 底层 Express 中间件的注册时机不可靠，拦截器在 Nest 请求生命周期内必然执行。

  // ─── 全局前缀 ────────────────────────────────────────────────
  app.setGlobalPrefix('api/v1');

  // ─── 全局管道（DTO 验证） ────────────────────────────────────
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // ─── 全局异常过滤器 ──────────────────────────────────────────
  app.useGlobalFilters(new AllExceptionsFilter());

  // ─── 全局限流守卫 ────────────────────────────────────────────
  // 注意：在 AppModule 中已通过 APP_GUARD 注册，此处不重复

  // ─── 统一 API 响应拦截器 ─────────────────────────────────────
  // （安全响应头已并入该拦截器内部实现，见 ApiResponseInterceptor.applySecurityHeaders）
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  // ─── Swagger API 文档 ────────────────────────────────────────
  const swaggerConfig = new DocumentBuilder()
    .setTitle('AceProxy API')
    .setDescription('AceProxy 跨境电商代购平台 API 文档 — 支持 ID/TH/PH 多国市场')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer('http://localhost:3001', 'Local Development')
    .addServer('https://api.aceproxy.id', 'Production')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // ─── 优雅关闭：收到 SIGTERM 时先处理完在途请求再退出 ───────────
  // 缺失此项时，部署/重启会硬中断进行中的下单与支付回调。
  app.enableShutdownHooks();

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  const host = process.env.HOST || '0.0.0.0';
  logger.log(`🚀 AceProxy Server running on: http://${host}:${port}/api/v1`);
  logger.log(`📚 API Docs: http://${host}:${port}/api/docs`);
}
bootstrap();
