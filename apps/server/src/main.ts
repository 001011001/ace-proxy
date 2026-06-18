import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ApiResponseInterceptor } from './common/interceptors/ApiResponseInterceptor';
import { ThrottlerGuard } from './common/guards/ThrottlerGuard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // CORS — 生产模式白名单，开发模式宽松
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
    'https://d019ff30096a420ca632cabf74b4c5f6.app.codebuddy.work',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (isDev) {
        if (!origin || origin === 'null') { callback(null, true); return; }
        const allowed = devWhitelist.some(h => origin === h);
        if (!allowed) console.warn(`[CORS][DEV] Blocked origin: ${origin}`);
        callback(null, allowed);
      } else {
        const allowed = !origin || prodWhitelist.some(h => origin === h || origin.startsWith(h + '/'));
        if (!allowed) console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(null, allowed);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Country', 'X-Callback-Token', 'Idempotency-Key'],
  });
  
  // 设置全局前缀
  app.setGlobalPrefix('api/v1');

  // 启用全局请求验证管道
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 全局限流守卫
  app.useGlobalGuards(new ThrottlerGuard());

  // 注册统一 API 响应拦截器
  app.useGlobalInterceptors(new ApiResponseInterceptor());

  // Swagger API 文档
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
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  
  const host = process.env.HOST || '0.0.0.0';
  console.log(`🚀 AceProxy Server is running on: http://${host}:${port}/api/v1`);
}
bootstrap();
