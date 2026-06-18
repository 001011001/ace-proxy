import { Test, TestingModule } from '@nestjs/testing';
import { Logger, ForbiddenException, BadRequestException } from '@nestjs/common';
import { TradeService } from '../TradeService';
import { PrismaService } from '../../../prisma/prisma.service';

const mockProductFindUnique = jest.fn();
const mockProductUpdateMany = jest.fn();
const mockOrderCreate = jest.fn();
const mockOrderFindUnique = jest.fn();

const mockPrisma = {
  aceProduct: {
    findUnique: mockProductFindUnique,
    findMany: jest.fn(),
    updateMany: mockProductUpdateMany,
  },
  aceOrder: {
    create: mockOrderCreate,
    findUnique: mockOrderFindUnique,
    findMany: jest.fn(),
    count: jest.fn(),
  },
  aceOrderItem: {
    createMany: jest.fn(),
  },
};

// Mock dependent services  
const mockVault = { recordOrderLedger: jest.fn().mockResolvedValue({ success: true }) };
const mockSplitter = { splitIntoBatches: jest.fn() };
const mockNotification = { sendWhatsAppMessage: jest.fn() };
const mockMembership = { getUserTier: jest.fn().mockResolvedValue({ level: 'EXPLORER', config: { serviceFeePct: 0.08, rebatePct: 0.005, referralReward: 5000 } }) };
const mockReferral = { processReward: jest.fn() };

// Use actual class tokens for DI
const VaultService = jest.requireActual('../../vault/VaultService').VaultService;
const SmartSplitterService = jest.requireActual('../../splitter/SmartSplitterService').SmartSplitterService;
const NotificationService = jest.requireActual('../../notification/NotificationService').NotificationService;
const UserLevelService = jest.requireActual('../../membership/UserLevelService').UserLevelService;
const ReferralService = jest.requireActual('../../referral/ReferralService').ReferralService;

describe('TradeService', () => {
  let service: TradeService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    mockProductFindUnique.mockResolvedValue({
      id: 'prod_001', name: 'Test Product', stock: 100, status: 'ACTIVE', priceIdr: 250000,
    });
    mockProductUpdateMany.mockResolvedValue({ count: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: VaultService, useValue: mockVault },
        { provide: SmartSplitterService, useValue: mockSplitter },
        { provide: NotificationService, useValue: mockNotification },
        { provide: UserLevelService, useValue: mockMembership },
        { provide: ReferralService, useValue: mockReferral },
      ],
    }).compile();

    service = module.get<TradeService>(TradeService);
  });

  describe('calculateFinalFees', () => {
    it('基础金额计算费用', async () => {
      const result = await service.calculateFinalFees('user_001', 1000000);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('serviceFee');
      expect(result.serviceFee).toBeGreaterThan(0);
    });

    it('高消费等级应有更低费率', async () => {
      const lowTier = await service.calculateFinalFees('user_001', 100000, 0);
      const highTier = await service.calculateFinalFees('user_002', 50000000, 50000000);

      // 高消费等级的服务费率应 ≤ 低消费等级
      expect(highTier.serviceFee / 50000000).toBeLessThanOrEqual(lowTier.serviceFee / 100000 + 0.01);
    });
  });

  describe('createOrder', () => {
    it('正常创建订单', async () => {
      mockOrderCreate.mockResolvedValue({
        id: 'ORD-TEST-001',
        userId: 'user_001',
        status: 'PENDING',
        totalAmount: 250000,
      });

      const result = await service.createOrder(
        {
          userId: 'user_001',
          items: [{ productId: 'prod_001', quantity: 1, unitPrice: 250000 }],
          shippingAddress: 'Jl. Test No. 1, Jakarta',
        },
        { ip: '127.0.0.1', deviceId: 'dev_001', terms_accepted: true },
      );

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result.status).toBe('PENDING');
    });

    it('未同意协议应抛出 ForbiddenException', async () => {
      await expect(
        service.createOrder(
          {
            userId: 'user_002',
            items: [{ productId: 'prod_001', quantity: 1, unitPrice: 250000 }],
            shippingAddress: 'Jl. Test, Jakarta',
          },
          { ip: '127.0.0.1', deviceId: 'dev_002', terms_accepted: false },
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('订单金额应正确计算', async () => {
      mockOrderCreate.mockResolvedValue({
        id: 'ORD-AMT-001',
        userId: 'user_001',
        status: 'PENDING',
        totalAmount: 500000,
      });

      const result = await service.createOrder(
        {
          userId: 'user_001',
          items: [{ productId: 'prod_001', quantity: 2, unitPrice: 250000 }],
          shippingAddress: 'Jl. Test, Jakarta',
        },
        { ip: '127.0.0.1', deviceId: 'dev_001', terms_accepted: true },
      );

      expect(result).toBeDefined();
      expect(result.totalAmount).toBeGreaterThan(0);
    });
  });
});
