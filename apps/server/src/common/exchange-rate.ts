import { ID_CONFIG } from '../countries/id/config';
import { TH_CONFIG } from '../countries/th/config';
import { PH_CONFIG } from '../countries/ph/config';

/**
 * 各国配置条目通用接口（仅包含汇率相关字段）。
 */
interface CountryConfigLike {
  currency: { code: string; exchangeRateToCny: number };
  shipping?: { markup?: { perKg: number; perPiece: number } };
}

/**
 * 各国配置注册表，按国家代码索引。
 * 扩展新国家时只需在此添加条目。
 */
const COUNTRY_CONFIGS: Record<string, CountryConfigLike> = {
  ID: ID_CONFIG,
  TH: TH_CONFIG,
  PH: PH_CONFIG,
};

/**
 * 获取指定国家代码对应的 CNY→当地货币 汇率（不含汇率差加价）。
 *
 * @param country - 国家代码（大小写不敏感），如 'ID'、'TH'、'PH'
 * @returns 汇率值（1 CNY = ? 当地货币），默认返回 ID 汇率
 *
 * @example
 * ```ts
 * const rate = getExchangeRate('ID'); // 2200
 * const rate = getExchangeRate('TH'); // 5.0
 * ```
 */
export function getExchangeRate(country: string): number {
  const key = country.toUpperCase();
  const config = COUNTRY_CONFIGS[key];
  if (!config) {
    // 未知国家回退到印尼
    return ID_CONFIG.currency.exchangeRateToCny;
  }
  return config.currency.exchangeRateToCny;
}

/**
 * 获取指定国家代码对应的运费加价系数（用户端加价）。
 *
 * @param country - 国家代码（大小写不敏感）
 * @returns 加价系数 { perKg, perPiece }，默认返回通用值
 */
export function getShippingMarkup(country: string): { perKg: number; perPiece: number } {
  const key = country.toUpperCase();
  const config = COUNTRY_CONFIGS[key];
  if (!config?.shipping?.markup) {
    return { perKg: 15, perPiece: 5 };
  }
  return config.shipping.markup;
}

/**
 * 获取指定国家代码对应的默认货币代码。
 *
 * @param country - 国家代码（大小写不敏感）
 * @returns ISO 4217 货币代码
 */
export function getDefaultCurrency(country: string): string {
  const key = country.toUpperCase();
  const config = COUNTRY_CONFIGS[key];
  if (!config) {
    return 'USD';
  }
  return config.currency.code;
}

/**
 * 汇率差加价系数。
 * 所有国家统一使用 1.03（3% 汇率差利润）。
 */
export const EXCHANGE_MARKUP = 1.03;
