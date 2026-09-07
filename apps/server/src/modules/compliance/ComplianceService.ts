import { Injectable, Logger } from '@nestjs/common';

/**
 * ComplianceService — 合规中心
 *
 * 集中管理所有合规检查逻辑：
 * 1. 禁运品类检查（电池/液体/粉末/食品/药品等）
 * 2. 目的国法规检查（印尼 BPOM/泰国 FDA 等）
 * 3. 平台政策检查（Shopee/Tokopedia 禁售清单）
 * 4. 关税分类建议（HS Code 推荐）
 */
@Injectable()
export class ComplianceService {
  private readonly logger = new Logger(ComplianceService.name);

  // 国际禁运品类
  static readonly BANNED_CATEGORIES: Record<string, string[]> = {
    DANGEROUS_GOODS: ['锂电池', '充电宝', '打火机', '火柴', '烟花', '压缩气体'],
    WEAPONS: ['刀具', '仿真枪', '电击器', '防狼喷雾'],
    DRUGS: ['药品', '处方药', '麻醉品', '兴奋剂'],
    FLAMMABLE: ['汽油', '酒精', '油漆', '香水（含酒精>70%）'],
    LIVE_ANIMALS: ['活体动物', '宠物', '昆虫'],
    PORNOGRAPHY: ['色情用品', '成人玩具（露骨）'],
    COUNTERFEIT: ['仿牌', '假货', '盗版'],
  };

  // 特殊品类（可运输但需额外文件）
  static readonly RESTRICTED_CATEGORIES: Record<string, { label: string; requiredDocs: string[] }> = {
    BATTERY: { label: '含电池产品', requiredDocs: ['MSDS', 'UN38.3检测报告'] },
    LIQUID: { label: '液体产品', requiredDocs: ['MSDS', '非危证明'] },
    FOOD: { label: '食品', requiredDocs: ['卫生证书', '原产地证明'] },
    COSMETICS: { label: '化妆品', requiredDocs: ['化妆品备案', '成分表'] },
    ELECTRONICS: { label: '电子产品', requiredDocs: ['CE/FCC认证', 'RoHS报告'] },
    TOYS: { label: '玩具', requiredDocs: ['EN71检测', 'CCC认证'] },
    TEXTILES: { label: '纺织品', requiredDocs: ['成分标签', '甲醛检测'] },
    MEDICAL: { label: '医疗器械', requiredDocs: ['FDA/CE注册', '临床报告'] },
  };

  // 目的国特殊法规
  static readonly COUNTRY_REGULATIONS: Record<string, { agency: string; rules: string[] }> = {
    ID: {
      agency: 'BPOM（印尼食品药品监管局）',
      rules: [
        '化妆品需 BPOM 注册号',
        '食品需 BPOM 认证',
        '电子产品需 SNI 认证',
        '纺织品需 SNI 标签',
        '玩具需 SNI 认证',
      ],
    },
    TH: {
      agency: 'FDA Thailand',
      rules: [
        '化妆品需 FDA 注册',
        '食品需 FDA 进口许可',
        '电子产品需 NBTC 认证',
      ],
    },
    PH: {
      agency: 'FDA Philippines',
      rules: [
        '化妆品需 FDA CPR 注册',
        '食品需 FDA LTO 许可',
        '电子产品需 NTC 认证',
      ],
    },
    BR: {
      agency: 'ANVISA',
      rules: [
        '化妆品需 ANVISA 注册',
        '电子产品需 ANATEL 认证',
        '玩具需 INMETRO 认证',
      ],
    },
  };

  /**
   * 全面合规检查
   */
  async checkCompliance(product: {
    name: string;
    category: string;
    description?: string;
    destinationCountry: string;
  }) {
    const results: ComplianceCheckResult = {
      passed: true,
      banned: [],
      restricted: [],
      countryIssues: [],
      hsCodeSuggestion: null,
    };

    // 1. 禁运品检查
    const bannedCheck = this.checkBannedItems(product.name, product.description || '');
    if (bannedCheck.length > 0) {
      results.passed = false;
      results.banned = bannedCheck;
    }

    // 2. 限制品类检查
    const restrictedCheck = this.checkRestrictedItems(product.category, product.name);
    if (restrictedCheck.length > 0) {
      results.restricted = restrictedCheck;
    }

    // 3. 目的国法规检查
    const countryCheck = this.checkCountryRegulations(
      product.category,
      product.destinationCountry,
    );
    if (countryCheck.length > 0) {
      results.countryIssues = countryCheck;
    }

    // 4. HS Code 建议
    results.hsCodeSuggestion = this.suggestHSCode(product.category, product.name);

    this.logger.log(`[Compliance] ${product.name}: ${results.passed ? 'PASS' : 'BLOCKED'} (${results.banned.length} banned, ${results.restricted.length} restricted)`);

    return results;
  }

  /**
   * 快速检查 — 返回 true/false
   */
  async quickCheck(name: string, category: string, country: string): Promise<boolean> {
    const result = await this.checkCompliance({ name, category, destinationCountry: country });
    return result.passed;
  }

  /**
   * 获取品类的合规要求清单
   */
  getCategoryRequirements(category: string, country: string) {
    const restricted = this.checkRestrictedItems(category, '');
    const countryRules = this.checkCountryRegulations(category, country);
    const hsCode = this.suggestHSCode(category, '');

    return {
      category,
      country,
      hsCode,
      restrictedDocuments: restricted.map(r => r.requiredDocs).flat(),
      countryRegulations: countryRules,
    };
  }

  // ─── 内部检查方法 ───

  private checkBannedItems(name: string, description: string): string[] {
    const text = `${name} ${description}`.toLowerCase();
    const banned: string[] = [];

    for (const [category, keywords] of Object.entries(ComplianceService.BANNED_CATEGORIES)) {
      for (const keyword of keywords) {
        if (text.includes(keyword.toLowerCase())) {
          banned.push(`${category}: ${keyword}`);
        }
      }
    }

    return banned;
  }

  private checkRestrictedItems(category: string, name: string) {
    const restricted: Array<{ label: string; requiredDocs: string[] }> = [];

    const categoryLower = category.toLowerCase();
    const nameLower = name.toLowerCase();

    if (categoryLower.includes('electron') || nameLower.includes('电池') || nameLower.includes('battery')) {
      restricted.push(ComplianceService.RESTRICTED_CATEGORIES.BATTERY);
    }
    if (categoryLower.includes('beauty') || categoryLower.includes('cosmetic') || nameLower.includes('化妆品')) {
      restricted.push(ComplianceService.RESTRICTED_CATEGORIES.COSMETICS);
    }
    if (categoryLower.includes('food') || nameLower.includes('食品')) {
      restricted.push(ComplianceService.RESTRICTED_CATEGORIES.FOOD);
    }
    if (categoryLower.includes('toy') || nameLower.includes('玩具')) {
      restricted.push(ComplianceService.RESTRICTED_CATEGORIES.TOYS);
    }
    if (categoryLower.includes('electron') && !nameLower.includes('电池')) {
      restricted.push(ComplianceService.RESTRICTED_CATEGORIES.ELECTRONICS);
    }

    return restricted;
  }

  private checkCountryRegulations(category: string, country: string): string[] {
    const regulations = ComplianceService.COUNTRY_REGULATIONS[country.toUpperCase()];
    if (!regulations) return [];

    const issues: string[] = [];
    const categoryLower = category.toLowerCase();

    for (const rule of regulations.rules) {
      if (
        (rule.includes('化妆品') && categoryLower.includes('beauty')) ||
        (rule.includes('食品') && categoryLower.includes('food')) ||
        (rule.includes('电子产品') && categoryLower.includes('electron')) ||
        (rule.includes('玩具') && categoryLower.includes('toy')) ||
        (rule.includes('纺织品') && categoryLower.includes('fashion'))
      ) {
        issues.push(`${regulations.agency}: ${rule}`);
      }
    }

    return issues;
  }

  private suggestHSCode(category: string, name: string): string | null {
    const categoryLower = category.toLowerCase();
    const nameLower = name.toLowerCase();

    // 简化版 HS Code 映射（前6位国际通用）
    const hsMap: Record<string, string> = {
      fashion: '61 - 服装及衣着附件',
      beauty: '33 - 精油及香膏；化妆品',
      electronics: '85 - 电机、电气设备',
      home: '94 - 家具；寝具',
      toys: '95 - 玩具、游戏品',
      sports: '95 - 运动用品',
      food: '21 - 杂项食品',
      automotive: '87 - 车辆及其零件',
      baby: '95 - 婴儿用品',
      pet: '23 - 动物饲料',
    };

    for (const [key, hs] of Object.entries(hsMap)) {
      if (categoryLower.includes(key) || nameLower.includes(key)) {
        return hs;
      }
    }

    return null;
  }
}

export interface ComplianceCheckResult {
  passed: boolean;
  banned: string[];
  restricted: Array<{ label: string; requiredDocs: string[] }>;
  countryIssues: string[];
  hsCodeSuggestion: string | null;
}
