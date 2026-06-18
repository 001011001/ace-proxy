/**
 * CSV 转义工具
 *
 * 防止 CSV 注入攻击（CSV Injection / Formula Injection）。
 * 当字段首字符为 =、+、-、@ 时，在前面添加单引号前缀。
 *
 * 参考：OWASP CSV Injection
 */

const DANGEROUS_PREFIXES = ['=', '+', '-', '@'];

/**
 * 对单个 CSV 字段进行安全转义
 *
 * @param value 原始字段值
 * @returns 安全转义后的字符串
 */
export function escapeCsvField(value: unknown): string {
  const str = value == null ? '' : String(value);

  // 如果字段包含逗号、双引号或换行符，需要用双引号包裹
  const needsQuoting = /[",\n\r]/.test(str);

  if (needsQuoting) {
    // 双引号转义："" → """"
    const escaped = str.replace(/"/g, '""');
    return `"${escaped}"`;
  }

  // 防止 CSV 注入：首字符为危险字符时加单引号前缀
  if (str.length > 0 && DANGEROUS_PREFIXES.includes(str[0])) {
    return `'${str}`;
  }

  return str;
}

/**
 * 将一行数据转为 CSV 行字符串
 *
 * @param fields 字段值数组
 * @returns CSV 行（逗号分隔）
 */
export function formatCsvRow(fields: unknown[]): string {
  return fields.map(escapeCsvField).join(',');
}
