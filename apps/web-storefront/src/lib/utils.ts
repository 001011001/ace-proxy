import { type ClassValue } from './types';

/** Tailwind 类名合并（轻量版 cn，避免额外依赖 clsx） */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * 格式化印尼盾价格
 * @param value 价格数值
 * @param currency 货币符号，默认 Rp
 */
export function formatPrice(value: number | null | undefined, currency = 'Rp'): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `${currency} ${Math.round(value).toLocaleString('id-ID')}`;
}

/** 格式化人民币价格 */
export function formatCNY(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) return '-';
  return `¥${Number(value).toFixed(2)}`;
}

/**
 * 计算节省百分比
 * @param sourcePrice 货源价（CNY 成本折算后的本地价，这里用同一币种对比）
 * @param ourPrice 我们的售价
 */
export function calcSavingsPct(sourcePrice: number, ourPrice: number): number {
  if (!sourcePrice || sourcePrice <= 0) return 0;
  return Math.round(((ourPrice - sourcePrice) / ourPrice) * 100);
}

/** 解析 imageUrls 字段（可能是 JSON 字符串或数组） */
export function parseImages(imageUrls: unknown): string[] {
  if (!imageUrls) return [];
  if (Array.isArray(imageUrls)) return imageUrls.filter(Boolean);
  if (typeof imageUrls === 'string') {
    try {
      const parsed = JSON.parse(imageUrls);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      // 非 JSON 字符串，可能是单张图片 URL
      return imageUrls.startsWith('http') ? [imageUrls] : [];
    }
  }
  return [];
}

/** 生成商品占位图（无图时的 fallback） */
export function placeholderImage(seed: string): string {
  const hue = seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="hsl(${hue},70%,92%)"/><text x="50%" y="50%" font-family="sans-serif" font-size="22" font-weight="bold" fill="hsl(${hue},50%,35%)" text-anchor="middle" dominant-baseline="middle">AceProxy</text></svg>`,
  )}`;
}

/** 截断文本 */
export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

/** 格式化日期为本地化字符串 */
export function formatDate(date: string | Date, locale = 'id-ID'): string {
  try {
    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '-';
  }
}

/** 格式化日期+时间（物流时间线用，需精确到时刻） */
export function formatDateTime(date: string | Date, locale = 'id-ID'): string {
  try {
    return new Date(date).toLocaleString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '-';
  }
}
