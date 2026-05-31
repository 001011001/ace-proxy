import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 启用跨域，支持移动端和 Web 管理端访问
  app.enableCors();
  
  // 设置全局前缀
  app.setGlobalPrefix('api/v1');
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 AceProxy Server is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
