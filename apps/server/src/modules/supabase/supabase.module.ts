import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';
import { SupabaseAuthService } from './supabase-auth.service';
import { SupabaseAuthController } from './supabase-auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * SupabaseModule — Supabase 集成模块
 *
 * 导出：
 * - SupabaseService：supabase-js 客户端（Auth / Realtime / Storage）
 * - SupabaseAuthService：Supabase Auth 代替 Google OAuth（email + social login）
 */
@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' as const },
      }),
    }),
  ],
  controllers: [SupabaseAuthController],
  providers: [SupabaseService, SupabaseAuthService],
  exports: [SupabaseService, SupabaseAuthService],
})
export class SupabaseModule {}
