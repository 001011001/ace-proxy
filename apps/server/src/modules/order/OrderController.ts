import { Controller, Get, Query, Param, Res, Req, UseGuards, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { escapeCsvField } from '../../common/csv-escape';

/** 具备跨用户数据访问权限的角色（管理后台运营需要全量视图） */
const PRIVILEGED_ROLES = ['GOD_MODE', 'ADMIN', 'SUPER_ADMIN', 'OPERATIONS'];

function isPrivilegedRole(role?: string): boolean {
  return !!role && PRIVILEGED_ROLES.includes(role.toUpperCase());
}

/**
 * OrderController — 订单管理后台 API
 */
@ApiTags('Order — 订单')
@Controller('order')
export class OrderController {
  constructor(private readonly prisma: PrismaService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: '订单列表', description: '分页查询订单，支持状态过滤和日期范围' })
  @ApiResponse({ status: 200, description: '返回分页订单列表' })
  @UseGuards(JwtAuthGuard)
  @Get('list')
  async list(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || '1', 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit || '20', 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // ─── 数据隔离：普通用户仅能查看自己的订单 ───
    // 管理员角色可跨用户查看（管理后台运营需要），其余强制按 userId 过滤，
    // 否则任何已登录用户都能读取全平台订单（越权/数据泄露）。
    if (!isPrivilegedRole(req.user?.role) && req.user?.userId) {
      where.userId = req.user.userId;
    }

    if (status && status !== 'ALL') where.status = status;

    // 日期范围过滤
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        const sd = new Date(startDate);
        if (!isNaN(sd.getTime())) where.createdAt.gte = sd;
      }
      if (endDate) {
        const ed = new Date(endDate);
        if (!isNaN(ed.getTime())) {
          ed.setHours(23, 59, 59, 999);
          where.createdAt.lte = ed;
        }
      }
      if (Object.keys(where.createdAt).length === 0) delete where.createdAt;
    }

    const [orders, total] = await Promise.all([
      this.prisma.aceOrder.findMany({
        where, orderBy: { createdAt: 'desc' }, skip, take: limitNum,
        select: { id: true, status: true, totalAmount: true, createdAt: true, userId: true, country: true },
      }),
      this.prisma.aceOrder.count({ where }),
    ]);
    return {
      items: orders,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: '订单物流时间线', description: '返回订单的 15 节点物流轨迹' })
  @UseGuards(JwtAuthGuard)
  @Get(':id/timeline')
  async timeline(@Req() req: any, @Param('id') id: string) {
    // ─── 归属校验：非管理员仅可查看自己订单的物流轨迹 ───
    // 否则任何人拿到订单号即可枚举全平台物流信息。
    if (!isPrivilegedRole(req.user?.role)) {
      const order = await this.prisma.aceOrder.findUnique({
        where: { id },
        select: { userId: true },
      });
      if (!order) throw new ForbiddenException('Order not found');
      if (order.userId !== req.user?.userId) {
        throw new ForbiddenException('You can only view your own orders');
      }
    }

    const nodes = await this.prisma.aceLogisticsNode.findMany({
      where: { orderId: id }, orderBy: { timestamp: 'asc' },
    });
    const labels: Record<string, string> = {
      CREATED: '已创建', PAID: '已支付', MATCHING: '匹配货源中',
      MATCHED: '已匹配', PURCHASING: '采购中', PURCHASED: '已采购',
      WAREHOUSE_RECEIVED: '已入库', QC_PASSED: '质检通过', QC_FAILED: '质检未通过',
      CONSOLIDATING: '集运中', CONSOLIDATED: '已集运', SHIPPED: '已发货',
      CUSTOMS: '清关中', IN_TRANSIT: '运输中', DELIVERED: '已签收',
    };
    return nodes.map(n => ({ ...n, label: labels[n.node] || n.node, time: n.timestamp.toISOString() }));
  }

  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const orders = await this.prisma.aceOrder.findMany({
      orderBy: { createdAt: 'desc' }, take: 500,
      select: { id: true, userId: true, status: true, totalAmount: true, sourceCost: true, shippingFee: true, serviceFee: true, country: true, createdAt: true },
    });
    const header = '订单号,用户ID,状态,总金额(IDR),采购成本(CNY),运费(CNY),服务费(CNY),国家,创建时间\n';
    const rows = orders.map(o =>
      [
        escapeCsvField(o.id),
        escapeCsvField(o.userId),
        escapeCsvField(o.status),
        escapeCsvField(o.totalAmount),
        escapeCsvField(o.sourceCost ?? ''),
        escapeCsvField(o.shippingFee ?? ''),
        escapeCsvField(o.serviceFee ?? ''),
        escapeCsvField(o.country ?? ''),
        escapeCsvField(o.createdAt.toISOString()),
      ].join(','),
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="orders-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(header + rows);
  }
}
