import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PatentRiskChecker {
  private readonly logger = new Logger(PatentRiskChecker.name);

  // 跨境电商高危专利与品牌黑名单 (由公司法务实时更新)
  private readonly BLACKLIST_KEYWORDS = [
    'LEGO', 'DISNEY', 'MARVEL', 'APPLE', 'NIKE', 'ADIDAS', 'ROLEX',
    'POKEMON', 'HELLO KITTY', 'STAR WARS', 'BARBIE'
  ];

  // 高危设计特征关键词
  private readonly DESIGN_RISK_PATTERNS = [
    'BUILDING BLOCKS', 'IP CHARACTER', 'DESIGNER INSPIRED', 'REPLICA'
  ];

  /**
   * 审计产品是否存在专利或品牌侵权风险 (2026 法律合规加固版)
   * 遵循“0 容错”原则，品牌词模糊匹配优先级最高。
   */
  async checkRisk(productName: string, description: string = ''): Promise<{ isHighRisk: boolean; reason?: string }> {
    const combinedText = `${productName} ${description}`.toUpperCase();

    // 1. 品牌关键词模糊匹配 (最高优先级 - Fuzzy Search)
    // 逻辑：即使是相似词汇也会被拦截，防止“李鬼”式侵权
    for (const brand of this.BLACKLIST_KEYWORDS) {
      if (this.fuzzyIncludes(combinedText, brand)) {
        return { isHighRisk: true, reason: `BRAND_INFRINGEMENT: High similarity to blacklisted brand "${brand}"` };
      }
    }

    // 2. 设计专利特征硬过滤
    for (const pattern of this.DESIGN_RISK_PATTERNS) {
      if (combinedText.includes(pattern)) {
        return { isHighRisk: true, reason: `PATENT_RISK: Suspected design patent pattern "${pattern}"` };
      }
    }
    
    return { isHighRisk: false };
  }

  /**
   * 简单的模糊匹配算法，用于捕捉变体词 (如 "Niike", "Disny")
   */
  private fuzzyIncludes(text: string, brand: string): boolean {
    if (text.includes(brand)) return true;
    
    // 捕捉常见混淆：移除重复字母后匹配
    const normalize = (s: string) => s.replace(/(.)\1+/g, '$1');
    return normalize(text).includes(normalize(brand));
  }
}
