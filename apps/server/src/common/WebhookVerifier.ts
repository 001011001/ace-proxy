import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { ConfigurationError } from './ConfigurationError';

/**
 * WebhookVerifier — Xendit Webhook 签名验证
 *
 * Xendit 支持两种验证方式：
 * 1. Callback Token（简单）：对比 X-Callback-Token header
 * 2. HMAC Signature（安全）：Xendit 用 webhook secret 对 body 做 HMAC-SHA256
 *
 * 本模块两种均支持，P0 先用 Callback Token，P2 升级 HMAC。
 *
 * 安全约束：TOKEN/SECRET 缺失时抛 ConfigurationError 而非静默跳过，
 * 杜绝生产环境未配置验证密钥导致回调被伪造的风险。
 */
@Injectable()
export class WebhookVerifier {
  private readonly logger = new Logger(WebhookVerifier.name);

  /**
   * 通过 Callback Token 验证（简单方式）
   * 对比请求头中的 X-Callback-Token 与环境变量 XENDIT_CALLBACK_TOKEN
   *
   * @throws ConfigurationError 当 XENDIT_CALLBACK_TOKEN 未配置时
   */
  verifyCallbackToken(token: string | undefined): void {
    const expected = process.env.XENDIT_CALLBACK_TOKEN;

    if (!expected || expected.length < 10) {
      throw new ConfigurationError('WebhookVerifier/CallbackToken', ['XENDIT_CALLBACK_TOKEN']);
    }

    if (!token || token !== expected) {
      this.logger.warn(`[Webhook] Invalid callback token. Received: ${token?.substring(0, 8)}...`);
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  /**
   * 通过 HMAC-SHA256 签名验证（安全方式）
   * Xendit 在 x-xendit-signature header 中发送 HMAC 签名
   *
   * @param rawBody 原始请求体（必须是 JSON string，不可用已 parse 的对象）
   * @param signatureHeader x-xendit-signature 的值
   * @throws ConfigurationError 当 XENDIT_WEBHOOK_SECRET 未配置时
   */
  verifyHmacSignature(rawBody: string, signatureHeader: string | undefined): void {
    const secret = process.env.XENDIT_WEBHOOK_SECRET;

    if (!secret || secret.length < 10) {
      throw new ConfigurationError('WebhookVerifier/HMAC', ['XENDIT_WEBHOOK_SECRET']);
    }

    if (!signatureHeader) {
      throw new UnauthorizedException('Missing Xendit HMAC signature');
    }

    const computed = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf-8')
      .digest('hex');

    if (signatureHeader !== computed) {
      this.logger.warn(`[Webhook] HMAC mismatch. Expected: ${computed.substring(0, 16)}... Got: ${signatureHeader.substring(0, 16)}...`);
      throw new UnauthorizedException('Invalid webhook HMAC signature');
    }

    this.logger.log('[Webhook] HMAC signature verified ✅');
  }

  /**
   * 包装验证 — 尝试 HMAC 优先，fallback 到 Callback Token
   */
  verify(rawBody: string, callbackToken?: string, hmacSignature?: string): void {
    const secret = process.env.XENDIT_WEBHOOK_SECRET;

    if (secret && secret.length >= 10) {
      this.verifyHmacSignature(rawBody, hmacSignature);
    } else {
      this.verifyCallbackToken(callbackToken);
    }
  }
}
