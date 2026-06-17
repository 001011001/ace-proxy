/**
 * ConfigurationError — 服务未正确配置时抛出，禁止静默返回假数据
 *
 * 凡依赖外部 API 的服务（Payment/1688/京东/淘宝/Xendit等），
 * 如果必需的 API Key 未配置，MUST throw 此异常而非返回 mock。
 *
 * 生产环境：controller 捕获 → 返回 503 Service Unavailable
 * 开发环境：允许通过环境变量 ACE_PROXY_DEV_MOCK=true 启用 mock
 */
export class ConfigurationError extends Error {
  /** 未配置的服务名 */
  public readonly service: string;
  /** 缺少的环境变量 */
  public readonly missingVars: string[];

  constructor(service: string, missingVars: string[]) {
    super(
      `[${service}] Not configured. Missing env vars: ${missingVars.join(', ')}. ` +
      `Set ${missingVars.join(' / ')} in .env to enable this feature.`
    );
    this.name = 'ConfigurationError';
    this.service = service;
    this.missingVars = missingVars;
  }
}

/** 判断是否允许开发模式 mock */
export function isDevMockEnabled(): boolean {
  return process.env.ACE_PROXY_DEV_MOCK === 'true';
}

/** 检查必需的配置项，缺失则抛 ConfigurationError */
export function requireConfig(service: string, vars: Record<string, string | undefined>): void {
  const missing = Object.entries(vars)
    .filter(([_, v]) => !v || v.includes('your-') || v.length < 10)
    .map(([k]) => k);

  if (missing.length > 0) {
    if (isDevMockEnabled()) {
      console.warn(`[${service}] DEV_MOCK enabled — returning mock data. Missing: ${missing.join(', ')}`);
      return;
    }
    throw new ConfigurationError(service, missing);
  }
}
