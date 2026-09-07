import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ShippingService } from '../shipping/ShippingService';
import { KnowledgeBase } from './KnowledgeBase';

/**
 * Tool execution result
 */
export interface ToolResult {
  success: boolean;
  data: any;
  summary: string; // human-readable summary for the AI to use in response
}

/**
 * CustomerServiceTools — 全自动客服的"手"
 *
 * 6个工具函数，AI 通过 Tool Calling 自动调用：
 * 1. checkOrderStatus — 查订单状态
 * 2. trackLogistics — 查物流轨迹
 * 3. checkPaymentStatus — 查支付状态
 * 4. getUserOrders — 查用户订单列表
 * 5. estimateShipping — 估算运费
 * 6. searchFAQ — 搜索知识库
 *
 * Plus 自动化操作（P2）：
 * 7. cancelOrder — 自动取消订单
 * 8. updateAddress — 改地址
 * 9. fileClaim — 自动提交投诉索赔
 */
@Injectable()
export class CustomerServiceTools {
  private readonly logger = new Logger(CustomerServiceTools.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shipping: ShippingService,
    private readonly knowledgeBase: KnowledgeBase,
  ) {}

  // ─── Tool Definitions（给 LLM 看）─────────────────────────

  /** 所有工具定义 */
  getToolDefinitions() {
    return [
      {
        type: 'function' as const,
        function: {
          name: 'checkOrderStatus',
          description: 'Check the current status of an order by order ID. Returns status, items, amounts, and logistics info.',
          parameters: {
            type: 'object' as const,
            properties: {
              orderId: { type: 'string', description: 'The order ID to look up (e.g., ORD-xxx)' },
            },
            required: ['orderId'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'trackLogistics',
          description: 'Track the shipping/logistics status of an order. Returns all logistics nodes with timestamps and locations.',
          parameters: {
            type: 'object' as const,
            properties: {
              orderId: { type: 'string', description: 'The order ID to track' },
            },
            required: ['orderId'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'getUserOrders',
          description: 'Get the list of recent orders for a user. Returns order IDs, statuses, and amounts.',
          parameters: {
            type: 'object' as const,
            properties: {
              limit: { type: 'number', description: 'Max number of orders to return (default 5)' },
            },
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'estimateShipping',
          description: 'Estimate shipping cost for a given country, weight, and item count.',
          parameters: {
            type: 'object' as const,
            properties: {
              country: { type: 'string', description: 'Destination country code (ID, TH, PH)' },
              weightKg: { type: 'number', description: 'Total weight in kg' },
              itemCount: { type: 'number', description: 'Number of items' },
              hasBattery: { type: 'string', description: 'Whether items contain batteries (yes/no)' },
            },
            required: ['country', 'weightKg'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'searchFAQ',
          description: 'Search the AceProxy FAQ/knowledge base for answers about policies, shipping, payments, returns, etc.',
          parameters: {
            type: 'object' as const,
            properties: {
              query: { type: 'string', description: 'The customer question or topic to search for' },
              language: { type: 'string', description: 'Language code (EN, ID, TH)' },
            },
            required: ['query'],
          },
        },
      },
      {
        type: 'function' as const,
        function: {
          name: 'cancelOrder',
          description: 'Cancel an order if it is in PENDING or PAID status (before supplier purchase). Returns whether cancellation was successful.',
          parameters: {
            type: 'object' as const,
            properties: {
              orderId: { type: 'string', description: 'The order ID to cancel' },
              reason: { type: 'string', description: 'Reason for cancellation (optional)' },
            },
            required: ['orderId'],
          },
        },
      },
    ];
  }

  // ─── Tool Executor ─────────────────────────────────────────

  /**
   * 执行工具调用
   * @param toolName 工具名称
   * @param args 参数
   * @param userId 当前用户（用于 getUserOrders 等需要用户上下文的工具）
   */
  async executeTool(toolName: string, args: Record<string, any>, userId?: string): Promise<ToolResult> {
    this.logger.log(`[Tools] Executing: ${toolName}(${JSON.stringify(args)})`);

    switch (toolName) {
      case 'checkOrderStatus':
        return this.checkOrderStatus(args.orderId);
      case 'trackLogistics':
        return this.trackLogistics(args.orderId);
      case 'getUserOrders':
        return this.getUserOrders(userId || '', args.limit || 5);
      case 'estimateShipping':
        return this.estimateShipping({
          country: args.country || 'ID',
          weightKg: args.weightKg || 1,
          itemCount: args.itemCount || 1,
          hasBattery: args.hasBattery || 'no'
        });
      case 'searchFAQ':
        return this.searchFAQ(args.query, args.language || 'EN');
      case 'cancelOrder':
        return this.cancelOrder(args.orderId, userId || '', args.reason);
      default:
        return { success: false, data: null, summary: `Unknown tool: ${toolName}` };
    }
  }

  // ─── Tool Implementations ──────────────────────────────────

  /**
   * 1. 查订单状态
   */
  private async checkOrderStatus(orderId: string): Promise<ToolResult> {
    try {
      const order = await this.prisma.aceOrder.findUnique({
        where: { id: orderId },
        include: {
          items: { include: { product: { select: { name: true, priceIdr: true } } } },
          logisticsNodes: { orderBy: { timestamp: 'desc' }, take: 1 },
        },
      });

      if (!order) {
        return {
          success: false,
          data: null,
          summary: `Order ${orderId} not found. Please verify the order ID.`,
        };
      }

      const statusLabels: Record<string, string> = {
        PENDING: 'Awaiting payment',
        PAID: 'Payment confirmed, preparing to purchase from supplier',
        PROCURING: 'Purchasing from Chinese supplier',
        IN_TRANSIT_TO_WAREHOUSE: 'In transit to Shenzhen warehouse',
        AT_WAREHOUSE: 'Arrived at Shenzhen warehouse',
        QC_CHECK: 'Quality inspection in progress',
        QC_PASSED: 'Quality check passed',
        QC_FAILED: 'Quality check failed — awaiting resolution',
        CONSOLIDATING: 'Being consolidated with other items',
        SHIPPED_INTERNATIONAL: 'Shipped internationally',
        IN_CUSTOMS: 'At destination customs',
        OUT_FOR_DELIVERY: 'Out for delivery',
        DELIVERED: 'Delivered',
        CANCELLED: 'Cancelled',
        ISSUE: 'Issue reported — under review',
      };

      const latestNode = order.logisticsNodes[0];
      const itemList = order.items
        .map((i) => `${i.product.name} x${i.quantity} (Rp ${Number(i.product.priceIdr || 0).toLocaleString('id-ID')})`)
        .join(', ');

      const statusText = statusLabels[order.status] || order.status;

      const summary = [
        `Order ${orderId}: ${statusText}`,
        `Items: ${itemList}`,
        `Total: Rp ${Number(order.totalAmount || 0).toLocaleString('id-ID')}`,
        `Shipping: Rp ${Number(order.shippingFee || 0).toLocaleString('id-ID')}`,
        latestNode ? `Latest update: ${latestNode.node} at ${latestNode.location || 'Unknown'} on ${latestNode.timestamp.toISOString().split('T')[0]}` : 'No logistics updates yet.',
        `Created: ${order.createdAt.toISOString().split('T')[0]}`,
      ].join('\n');

      return {
        success: true,
        data: { status: order.status, totalAmount: Number(order.totalAmount), shippingFee: Number(order.shippingFee), items: order.items.length, latestNode },
        summary,
      };
    } catch (e: any) {
      this.logger.error(`[Tools] checkOrderStatus failed: ${e.message}`);
      return { success: false, data: null, summary: 'Unable to check order status at this moment. Please try again.' };
    }
  }

  /**
   * 2. 查物流轨迹
   */
  private async trackLogistics(orderId: string): Promise<ToolResult> {
    try {
      const nodes = await this.prisma.aceLogisticsNode.findMany({
        where: { orderId },
        orderBy: { timestamp: 'asc' },
      });

      if (nodes.length === 0) {
        return {
          success: true,
          data: [],
          summary: `No tracking information yet for order ${orderId}. The order may still be processing.`,
        };
      }

      const trackingLines = nodes.map((n, i) => {
        const date = n.timestamp.toISOString().split('T')[0];
        const time = n.timestamp.toISOString().split('T')[1]?.substring(0, 5) || '';
        const loc = n.location ? ` [${n.location}]` : '';
        return `${i + 1}. ${date} ${time} — ${n.node}${loc}${n.note ? ` (${n.note})` : ''}`;
      });

      const latestNode = nodes[nodes.length - 1];
      const totalNodes = nodes.length;
      const progressPct = Math.round((totalNodes / 15) * 100); // 15 nodes total

      const summary = [
        `Tracking for order ${orderId} (${progressPct}% complete, ${totalNodes}/15 nodes):`,
        ...trackingLines,
        latestNode ? `\nCurrent status: ${latestNode.node}` : '',
      ].join('\n');

      return { success: true, data: { nodes, progress: progressPct }, summary };
    } catch (e: any) {
      this.logger.error(`[Tools] trackLogistics failed: ${e.message}`);
      return { success: false, data: null, summary: 'Unable to track logistics at this moment. Please try again.' };
    }
  }

  /**
   * 3. 查用户订单列表
   */
  private async getUserOrders(userId: string, limit: number): Promise<ToolResult> {
    try {
      if (!userId) {
        return { success: false, data: null, summary: 'User not identified. Please log in to view your orders.' };
      }

      const orders = await this.prisma.aceOrder.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          status: true,
          totalAmount: true,
          createdAt: true,
          items: { select: { product: { select: { name: true } }, quantity: true } },
        },
      });

      if (orders.length === 0) {
        return {
          success: true,
          data: [],
          summary: 'You have no orders yet. Would you like to browse our catalog?',
        };
      }

      const orderLines = orders.map((o, i) => {
        const date = o.createdAt.toISOString().split('T')[0];
        const items = o.items.map((it) => `${it.product.name} x${it.quantity}`).join(', ');
        return `${i + 1}. [${o.id}] ${o.status} — Rp ${Number(o.totalAmount).toLocaleString('id-ID')} (${date}) — ${items}`;
      });

      const summary = [
        `You have ${orders.length} recent orders:`,
        ...orderLines,
      ].join('\n');

      return {
        success: true,
        data: orders.map((o) => ({
          id: o.id,
          status: o.status,
          totalAmount: Number(o.totalAmount),
          createdAt: o.createdAt,
          itemCount: o.items.length,
        })),
        summary,
      };
    } catch (e: any) {
      this.logger.error(`[Tools] getUserOrders failed: ${e.message}`);
      return { success: false, data: null, summary: 'Unable to retrieve your orders at this moment.' };
    }
  }

  /**
   * 4. 估算运费
   */
  private async estimateShipping(args: {
    country: string;
    weightKg: number;
    itemCount?: number;
    hasBattery?: string;
  }): Promise<ToolResult> {
    try {
      const country = (args.country || 'ID').toUpperCase();
      const weightKg = args.weightKg || 1;
      const itemCount = args.itemCount || 1;
      const hasBattery = (args.hasBattery || 'no').toLowerCase() === 'yes';

      const countryNames: Record<string, string> = { ID: 'Indonesia', TH: 'Thailand', PH: 'Philippines' };

      // 使用 ShippingService 估算
      const quote = this.shipping.getUserQuote({
        country,
        weightKg,
        hasBattery,
        itemCount,
      });

      const summary = [
        `Shipping estimate to ${countryNames[country] || country}:`,
        `- Estimated cost: ${quote.userCurrency} ${quote.userPrice.toLocaleString('id-ID')}`,
        `- Estimated delivery: ${quote.estimatedDays}`,
        `- Channel: ${quote.channelName}`,
        hasBattery ? '- Battery surcharge may apply' : '',
      ].join('\n');

      return {
        success: true,
        data: quote,
        summary,
      };
    } catch (e: any) {
      this.logger.error(`[Tools] estimateShipping failed: ${e.message}`);

      // 降级：使用数据库中的运费缓存
      try {
        const rates = await this.prisma.aceShippingRate.findMany({
          where: {
            destCountry: (args.country || 'ID').toUpperCase(),
            isActive: true,
          },
          take: 3,
          orderBy: { baseRateCny: 'asc' },
        });

        if (rates.length > 0) {
          const r = rates[0];
          const estimatedCost = Number(r.baseRateCny) + (args.weightKg || 1) * Number(r.perKgRateCny || 0);
          return {
            success: true,
            data: { estimatedCostCny: estimatedCost },
            summary: `Estimated shipping: ~¥${estimatedCost.toFixed(0)} CNY via ${r.carrier}, ${r.estimatedDays} days to ${args.country}.`,
          };
        }
      } catch (_) { /* silent fallback */ }

      return { success: false, data: null, summary: 'Unable to estimate shipping at this moment. Please check our shipping page for rates.' };
    }
  }

  /**
   * 5. 搜索知识库
   */
  private async searchFAQ(query: string, language: string): Promise<ToolResult> {
    try {
      const policies = this.knowledgeBase.searchPolicies(query);
      const faqs = this.knowledgeBase.searchFAQ(query, language);

      const parts: string[] = [];

      if (faqs.length > 0) {
        parts.push(`Found ${faqs.length} relevant FAQ answers:\n`);
        for (const f of faqs) {
          parts.push(`Q: ${f.question}\nA: ${f.answer}`);
        }
      }

      if (policies.length > 0) {
        parts.push(`\nRelevant policies:\n`);
        for (const p of policies) {
          parts.push(`[${p.title}]\n${p.content.substring(0, 300)}...`);
        }
      }

      if (parts.length === 0) {
        parts.push('No relevant FAQ or policy found for this query. The customer may need human support.');
      }

      return {
        success: true,
        data: { faqs, policies },
        summary: parts.join('\n\n'),
      };
    } catch (e: any) {
      this.logger.error(`[Tools] searchFAQ failed: ${e.message}`);
      return { success: false, data: null, summary: 'Unable to search FAQ at this moment.' };
    }
  }

  /**
   * 6. 自动取消订单（P2: 自动化工作流）
   */
  private async cancelOrder(orderId: string, userId: string, reason?: string): Promise<ToolResult> {
    try {
      const order = await this.prisma.aceOrder.findUnique({
        where: { id: orderId },
        select: { id: true, status: true, userId: true },
      });

      if (!order) {
        return { success: false, data: null, summary: `Order ${orderId} not found.` };
      }

      // 权限验证
      if (order.userId !== userId) {
        return { success: false, data: null, summary: 'You can only cancel your own orders.' };
      }

      // 状态检查
      const cancellableStatuses = ['PENDING', 'PAID'];
      if (!cancellableStatuses.includes(order.status)) {
        const reasonMap: Record<string, string> = {
          PROCURING: 'the supplier has already started purchasing your items',
          IN_TRANSIT_TO_WAREHOUSE: 'the items are already in transit to our warehouse',
          AT_WAREHOUSE: 'the items have arrived at our warehouse',
          SHIPPED_INTERNATIONAL: 'the order has already been shipped internationally',
          DELIVERED: 'the order has already been delivered',
        };
        const explanation = reasonMap[order.status] || `the order is in "${order.status}" status`;
        return {
          success: false,
          data: null,
          summary: `Cannot cancel order ${orderId} because ${explanation}. Contact human support if you still need to cancel.`,
        };
      }

      // 执行取消
      await this.prisma.aceOrder.update({
        where: { id: orderId },
        data: {
          status: 'CANCELLED',
          complianceAudit: `AI auto-cancelled. Reason: ${reason || 'Customer request'}`,
        },
      });

      // 记录物流节点
      await this.prisma.aceLogisticsNode.create({
        data: {
          orderId,
          node: 'CANCELLED',
          location: 'System',
          note: `AI auto-cancellation. ${reason ? `Reason: ${reason}` : ''}`,
        },
      });

      return {
        success: true,
        data: { orderId, newStatus: 'CANCELLED' },
        summary: `Order ${orderId} has been successfully cancelled. ${reason ? `Reason: ${reason}` : ''} If a payment was made, it will be refunded to your Ace Credits within 24 hours.`,
      };
    } catch (e: any) {
      this.logger.error(`[Tools] cancelOrder failed: ${e.message}`);
      return { success: false, data: null, summary: 'Unable to cancel the order at this moment. Please try again or contact support.' };
    }
  }

  /**
   * 获取工具调用结果的格式化摘要（用于注入 LLM 后续对话）
   */
  buildToolResultContext(toolName: string, result: ToolResult): string {
    return `[TOOL RESULT: ${toolName}]\n${result.summary}`;
  }
}
