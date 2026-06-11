// cloudstudio-entry.js - CloudStudio 部署入口
// CloudStudio 会运行 npm start，需要确保端口可被外部访问
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./src/app.module');
const { ValidationPipe } = require('@nestjs/common');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS - 允许所有来源（生产环境应限制）
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : ['*'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-callback-token'],
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 AceProxy Backend running on port ${port}`);
  console.log(`📡 CORS allowed: ${allowedOrigins.join(', ')}`);
}

bootstrap().catch(console.error);
