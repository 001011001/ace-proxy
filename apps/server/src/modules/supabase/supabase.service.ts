import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * SupabaseService — 统一的 Supabase 客户端
 *
 * 提供：
 * - supabase-js 客户端（用于 Auth、Realtime、Storage）
 * - 预配置的 admin client（service_role key，可绕过 RLS）
 * - isConfigured() 判断是否已配置
 */
@Injectable()
export class SupabaseService implements OnModuleInit {
  private readonly logger = new Logger(SupabaseService.name);
  private _client: SupabaseClient | null = null;
  private _adminClient: SupabaseClient | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const url = this.config.get<string>('SUPABASE_URL');
    const anonKey = this.config.get<string>('SUPABASE_ANON_KEY');

    if (url && anonKey && url !== 'https://xxxxx.supabase.co') {
      this._client = createClient(url, anonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false, // server-side, no localStorage
        },
      });
      this.logger.log('✅ Supabase client initialized');
    } else {
      this.logger.warn('⚠️  Supabase not configured. Set SUPABASE_URL + SUPABASE_ANON_KEY in .env');
    }

    // Admin client (service_role)
    const serviceRoleKey = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY');
    if (url && serviceRoleKey && serviceRoleKey.startsWith('eyJ')) {
      this._adminClient = createClient(url, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      this.logger.log('✅ Supabase admin client initialized');
    }
  }

  /** 公共客户端（受限的 anon key） */
  get client(): SupabaseClient {
    if (!this._client) {
      throw new Error(
        'Supabase not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env\n' +
        'Get them from: https://app.supabase.com → Your Project → Settings → API'
      );
    }
    return this._client;
  }

  /** 管理客户端（service_role key，绕过 RLS） */
  get admin(): SupabaseClient {
    if (!this._adminClient) {
      throw new Error(
        'Supabase admin client not configured. Set SUPABASE_SERVICE_ROLE_KEY in .env'
      );
    }
    return this._adminClient;
  }

  /** 判断 Supabase 是否已配置 */
  isConfigured(): boolean {
    return this._client !== null;
  }

  /** 判断 admin client 是否可用 */
  hasAdmin(): boolean {
    return this._adminClient !== null;
  }
}
