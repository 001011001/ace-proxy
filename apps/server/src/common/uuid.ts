import * as crypto from 'crypto';

/**
 * 集中 UUID 工具
 *
 * 所有 UUID 生成统一从此模块导入，确保一致性和可追溯性。
 *
 * 命名规范：
 * - generateUUIDv4()      — 通用唯一 ID
 * - generateUUIDv7()      — 时间排序 UUID（需要 uuidv7 包）
 * - generateOrderId()     — 订单 ID，格式 ord_ + UUID v7
 * - generateInviteCode()  — 邀请码，格式 ACE-{PREFIX}-{4位数字}
 * - generateSessionId()   — 会话 ID
 * - generateMessageSid()  — 消息 SID，格式 wa_{10位随机}
 */

// --- UUID v4 (crypto.randomUUID, no external dependency) ---

export function generateUUIDv4(): string {
  return crypto.randomUUID();
}

// --- UUID v7 (time-sortable, requires uuidv7 package) ---

let _uuidv7: (() => string) | null = null;

function getUuidv7(): () => string {
  if (_uuidv7) return _uuidv7;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _uuidv7 = require('uuidv7').uuidv7;
  } catch {
    // Fallback: use crypto.randomUUID if uuidv7 is not installed
    _uuidv7 = () => crypto.randomUUID();
  }
  return _uuidv7;
}

export function generateUUIDv7(): string {
  return getUuidv7()();
}

// --- Order ID ---

export function generateOrderId(): string {
  return `ord_${generateUUIDv7()}`;
}

// --- Invite Code ---

export function generateInviteCode(partnerName: string): string {
  const prefix = partnerName.substring(0, 3).toUpperCase();
  const random = crypto.randomInt(1000, 10000);
  return `ACE-${prefix}-${random}`;
}

// --- Session ID ---

export function generateSessionId(): string {
  return `sess_${generateUUIDv4()}`;
}

// --- Message SID (WhatsApp-style) ---

export function generateMessageSid(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'wa_';
  for (let i = 0; i < 10; i++) {
    result += chars[crypto.randomInt(0, chars.length)];
  }
  return result;
}
