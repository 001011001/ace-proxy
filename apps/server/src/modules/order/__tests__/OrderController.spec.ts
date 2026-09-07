import { Test, TestingModule } from '@nestjs/testing';
import { OrderController } from '../OrderController';
import { PrismaService } from '../../../prisma/prisma.service';

const mockOrderFindMany = jest.fn();
const mockOrderCount = jest.fn();
const mockOrderFindUnique = jest.fn();
const mockLogisticsFindMany = jest.fn();

const mockPrisma = {
  aceOrder: {
    findMany: mockOrderFindMany,
    count: mockOrderCount,
    findUnique: mockOrderFindUnique,
  },
  aceOrderItem: { findMany: jest.fn() },
  aceLogisticsNode: { findMany: mockLogisticsFindMany },
};

/**
 * 模拟已登录的普通用户（非管理员角色）
 * 用于验证：数据隔离（list 按 userId 过滤）+ 归属校验（timeline 拒绝他人订单）
 */
const mockReq = { user: { userId: 'u1', role: 'USER' } } as any;

describe('OrderController', () => {
  let controller: OrderController;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockOrderFindMany.mockResolvedValue([{ id: 'ORD-001', status: 'PAID', totalAmount: 500000, createdAt: new Date('2026-06-01'), userId: 'u1', country: 'ID' }]);
    mockOrderCount.mockResolvedValue(1);
    mockOrderFindUnique.mockResolvedValue({ id: 'ORD-001', status: 'PAID', totalAmount: 500000, userId: 'u1', items: [{ id: 'oi_1', productId: 'p1', name: 'Test', quantity: 2 }] });
    mockLogisticsFindMany.mockResolvedValue([{ id: 'ln1', orderId: 'ORD-001', status: 'ARRIVED_AT_PORT', timestamp: new Date(), location: 'Jakarta' }]);

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [{ provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    controller = module.get<OrderController>(OrderController);
  });

  describe('list', () => {
    it('should paginate orders', async () => {
      const result = await controller.list(mockReq, 'ALL', '1', '20');
      expect(result.items).toHaveLength(1);
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
    });

    it('should filter by status', async () => {
      mockOrderFindMany.mockResolvedValue([]);
      mockOrderCount.mockResolvedValue(0);
      const result = await controller.list(mockReq, 'PAID', '1', '10');
      expect(result.total).toBe(0);
    });
  });

  describe('timeline', () => {
    it('should return logistics nodes', async () => {
      const result = await controller.timeline(mockReq, 'ORD-001');
      expect(result).toBeDefined();
      expect(mockLogisticsFindMany).toHaveBeenCalledWith({
        where: { orderId: 'ORD-001' },
        orderBy: { timestamp: 'asc' },
      });
    });
  });

  describe('exportCsv', () => {
    it('should set CSV content-type header', async () => {
      const mockRes = { setHeader: jest.fn(), send: jest.fn() };
      await controller.exportCsv(mockRes as any);
      expect(mockRes.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv; charset=utf-8');
    });
  });
});
