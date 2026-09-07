import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as crypto from 'crypto';

/**
 * CronService — 自动化定时任务中枢
 *
 * ═══════════════════════════════════════════
 *  Level 1 自动化：规则驱动，无需 AI
 * ═══════════════════════════════════════════
 *
 *  1. 每10分钟 → 24h 未支付订单自动取消
 *  2. 每30分钟 → 低库存预警（stock < 10）
 *  3. 每小时   → 异常订单扫描（PENDING > 72h）
 *  4. 每6小时  → 呆滞库存检测（30天未售出）
 *  5. 每天凌晨2点 → 退款率审计（> 5% 告警）
 *  6. 每天凌晨3点 → 7天购物车清理
 *  7. 每天凌晨6点 → 每日经营快照生成
 *  8. 启动时   → 供应商默认数据填充（表为空时）
 *
 * 所有告警输出到 Logger，可后续接入 NotificationService 推送。
 */
@Injectable()
export class CronService implements OnModuleInit {
  private readonly logger = new Logger(CronService.name);

  private readonly cancelExpiredCron: string;
  private readonly cleanupCartCron: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.cancelExpiredCron =
      this.config.get<string>('CRON_CANCEL_EXPIRED') || '0 */10 * * * *';
    this.cleanupCartCron =
      this.config.get<string>('CRON_CLEANUP_CART') || '0 0 3 * * *';
  }

  // ═══════════════════════════════════════════
  //  启动初始化：供应商数据填充
  // ═══════════════════════════════════════════

  async onModuleInit() {
    const count = await this.prisma.aceSupplier.count();
    if (count === 0) {
      await this.seedDefaultSuppliers();
    }
    this.logger.log('[Cron] Scheduler initialized — 8 automated tasks active');
  }

  private async seedDefaultSuppliers() {
    const suppliers = [
      { name: '义乌恒达饰品厂', avgLeadTime: 48, defectRate: 1.2 },
      { name: '广州南方电子科技', avgLeadTime: 72, defectRate: 0.8 },
      { name: '深圳华强北数码批发', avgLeadTime: 36, defectRate: 2.1 },
      { name: '杭州四季青服装批发', avgLeadTime: 60, defectRate: 1.5 },
      { name: '佛山顺德家具供应链', avgLeadTime: 120, defectRate: 3.2 },
      { name: '泉州晋江鞋业联盟', avgLeadTime: 84, defectRate: 1.8 },
      { name: '东莞虎门服装城', avgLeadTime: 48, defectRate: 2.4 },
      { name: '汕头澄海玩具基地', avgLeadTime: 72, defectRate: 1.0 },
      { name: '中山古镇灯饰集群', avgLeadTime: 96, defectRate: 2.7 },
      { name: '成都女鞋产业园', avgLeadTime: 108, defectRate: 1.6 },
    ];

    for (const s of suppliers) {
      await this.prisma.aceSupplier.create({
        data: {
          id: `SUP-${crypto.randomUUID().slice(0, 8)}`,
          name: s.name,
          avgLeadTime: s.avgLeadTime,
          defectRate: s.defectRate,
          status: 'ACTIVE',
        },
      });
    }
    this.logger.log(`[Cron] Seeded ${suppliers.length} default suppliers`);
  }

  // ═══════════════════════════════════════════
  //  任务 1：超时取消订单（已有）
  // ═══════════════════════════════════════════

  /** 每10分钟检查：24h未支付订单 → EXPIRED */
  @Cron('0 */10 * * * *')
  async cancelExpiredOrders() {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await this.prisma.aceOrder.updateMany({
      where: {
        status: 'PAID',
        createdAt: { lt: cutoff },
      },
      data: { status: 'EXPIRED' },
    });

    if (result.count > 0) {
      this.logger.log(`[Cron] Cancelled ${result.count} expired orders (PAID > 24h)`);
    }
  }

  // ═══════════════════════════════════════════
  //  任务 2：低库存预警（新增）
  // ═══════════════════════════════════════════

  /** 每30分钟检查：库存 < 10 的商品 */
  @Cron('0 */30 * * * *')
  async checkLowStock() {
    const lowStockProducts = await this.prisma.aceProduct.findMany({
      where: { stock: { lt: 10 }, status: 'ACTIVE' },
      select: { id: true, name: true, stock: true, costCny: true },
      orderBy: { stock: 'asc' },
    });

    if (lowStockProducts.length === 0) {
      this.logger.log('[Cron] Stock check: all products healthy ✅');
      return;
    }

    this.logger.warn(
      `[Cron] ⚠ LOW STOCK: ${lowStockProducts.length} products below 10 units`,
    );

    for (const p of lowStockProducts.slice(0, 5)) {
      const costInfo = p.costCny ? ` (cost: ¥${p.costCny})` : '';
      this.logger.warn(`  └─ ${p.name}  |  ${p.stock} left${costInfo}`);
    }

    if (lowStockProducts.length > 5) {
      this.logger.warn(`  └─ ... and ${lowStockProducts.length - 5} more`);
    }
  }

  // ═══════════════════════════════════════════
  //  任务 3：异常订单扫描（新增）
  // ═══════════════════════════════════════════

  /** 每小时检查：PENDING 状态超过 72h 的订单 */
  @Cron('0 0 * * * *')
  async scanStaleOrders() {
    const cutoff = new Date(Date.now() - 72 * 60 * 60 * 1000);

    const staleCount = await this.prisma.aceOrder.count({
      where: { status: 'PENDING', createdAt: { lt: cutoff } },
    });

    if (staleCount > 0) {
      this.logger.error(
        `[Cron] 🚨 STALE ORDERS: ${staleCount} orders stuck in PENDING > 72h — requires manual review!`,
      );

      // 自动取消超长待处理订单（> 7 天）
      const veryOld = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const cancelled = await this.prisma.aceOrder.updateMany({
        where: { status: 'PENDING', createdAt: { lt: veryOld } },
        data: { status: 'CANCELLED' },
      });

      if (cancelled.count > 0) {
        this.logger.warn(
          `[Cron] Auto-cancelled ${cancelled.count} orders (PENDING > 7 days)`,
        );
      }
    }
  }

  // ═══════════════════════════════════════════
  //  任务 4：呆滞库存检测（新增）
  // ═══════════════════════════════════════════

  /** 每6小时检查：上架超过30天但从未售出的商品 */
  @Cron('0 0 */6 * * *')
  async detectDeadStock() {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 查询：创建时间 > 30天，库存 > 0，但 orderItems 为空
    const deadProducts = await this.prisma.aceProduct.findMany({
      where: {
        stock: { gt: 0 },
        status: 'ACTIVE',
        createdAt: { lt: cutoff },
        orderItems: { none: {} },
      },
      select: { id: true, name: true, stock: true, costCny: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    if (deadProducts.length > 0) {
      this.logger.warn(
        `[Cron] 📦 DEAD STOCK: ${deadProducts.length} products unsold > 30 days — consider clearance`,
      );

      for (const p of deadProducts.slice(0, 5)) {
        const days = Math.floor((Date.now() - p.createdAt.getTime()) / 86400000);
        this.logger.warn(`  └─ ${p.name}  |  ${p.stock} units  |  ${days} days idle`);
      }
    }
  }

  // ═══════════════════════════════════════════
  //  任务 5：退款率每日审计（新增）
  // ═══════════════════════════════════════════

  /** 每天凌晨2点：审核退款率是否超过5%阈值 */
  @Cron('0 0 2 * * *')
  async auditRefundRate() {
    const totalGmvResult = await this.prisma.aceOrder.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    });
    const totalGmv = Number(totalGmvResult._sum.totalAmount || 0);

    const refundResult = await this.prisma.aceRefund.aggregate({
      _sum: { amount: true },
    });
    const totalRefund = Number(refundResult._sum.amount || 0);

    const refundRate = totalGmv > 0 ? (totalRefund / totalGmv) * 100 : 0;

    if (refundRate > 5) {
      this.logger.error(
        `[Cron] 🔴 REFUND RATE CRITICAL: ${refundRate.toFixed(2)}% exceeds 5% threshold! ` +
        `Total GMV: Rp ${(totalGmv / 1000000).toFixed(1)}M | Total Refunds: Rp ${(totalRefund / 1000000).toFixed(1)}M`,
      );
      this.logger.error(
        `[Cron] 🔴 ACTION REQUIRED: Review refund reasons, consider pausing high-risk regions`,
      );
    } else if (refundRate > 3) {
      this.logger.warn(
        `[Cron] 🟡 REFUND RATE WARNING: ${refundRate.toFixed(2)}% approaching 5% threshold`,
      );
    } else {
      this.logger.log(
        `[Cron] Refund rate audit: ${refundRate.toFixed(2)}% ✅`,
      );
    }
  }

  // ═══════════════════════════════════════════
  //  任务 6：每日经营快照（新增）
  // ═══════════════════════════════════════════

  /** 每天凌晨6点：生成昨日经营快照并写入日志 */
  @Cron('0 0 6 * * *')
  async dailySnapshot() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 昨日数据
    const yesterdayOrders = await this.prisma.aceOrder.findMany({
      where: { createdAt: { gte: yesterday, lt: today }, status: { not: 'CANCELLED' } },
      select: { totalAmount: true, status: true, country: true },
    });

    const yesterdayGmv = yesterdayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const yesterdayCount = yesterdayOrders.length;

    // 累计数据
    const totalUsers = await this.prisma.aceUser.count();
    const totalProducts = await this.prisma.aceProduct.count({ where: { status: 'ACTIVE' } });
    const totalOrders = await this.prisma.aceOrder.count();

    // 低库存商品数
    const lowStockCount = await this.prisma.aceProduct.count({
      where: { stock: { lt: 10 }, status: 'ACTIVE' },
    });

    const snapshot = {
      date: yesterday.toISOString().split('T')[0],
      gmv: Math.round(yesterdayGmv),
      orders: yesterdayCount,
      avgOrderValue: yesterdayCount > 0 ? Math.round(yesterdayGmv / yesterdayCount) : 0,
      totalUsers,
      activeProducts: totalProducts,
      totalOrders,
      lowStockAlerts: lowStockCount,
      generatedAt: new Date().toISOString(),
    };

    this.logger.log('═══════════════════════════════════════');
    this.logger.log(`📊 DAILY SNAPSHOT — ${snapshot.date}`);
    this.logger.log(`  GMV: Rp ${(snapshot.gmv / 1000000).toFixed(2)}M`);
    this.logger.log(`  Orders: ${snapshot.orders}`);
    this.logger.log(`  Avg Order: Rp ${(snapshot.avgOrderValue).toLocaleString()}`);
    this.logger.log(`  Active Users: ${snapshot.totalUsers}`);
    this.logger.log(`  Active Products: ${snapshot.activeProducts}`);
    this.logger.log(`  Low Stock Alerts: ${snapshot.lowStockAlerts}`);
    this.logger.log('═══════════════════════════════════════');

    // 同时写入 ChatLog 作为持久化记录（sessionId = 'SYSTEM_SNAPSHOT'）
    try {
      await this.prisma.chatLog.create({
        data: {
          sessionId: 'SYSTEM_SNAPSHOT',
          role: 'system',
          content: JSON.stringify(snapshot, null, 2),
          intent: 'daily_snapshot',
        },
      });
    } catch (e: any) {
      this.logger.warn(`[Cron] Failed to persist snapshot: ${e.message}`);
    }
  }

  // ═══════════════════════════════════════════
  //  任务 7：购物车清理（已有）
  // ═══════════════════════════════════════════

  /** 每天凌晨清理7天前的购物车 */
  @Cron('0 0 3 * * *')
  async cleanupCart() {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const result = await this.prisma.aceCartItem.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    if (result.count > 0) {
      this.logger.log(`[Cron] Cleaned up ${result.count} expired cart items (> 7 days)`);
    }
  }
}
