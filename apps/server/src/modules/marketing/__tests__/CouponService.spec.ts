import { Test, TestingModule } from '@nestjs/testing';
import { Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponService } from '../CouponService';
import { PrismaService } from '../../../prisma/prisma.service';

const mockCouponFindUnique = jest.fn();
const mockCouponUpdate = jest.fn();
const mockCouponFindMany = jest.fn();

const mockPrisma = {
  aceCoupon: {
    findUnique: mockCouponFindUnique,
    findFirst: mockCouponFindUnique,
    findMany: mockCouponFindMany,
    update: mockCouponUpdate,
  },
};

describe('CouponService', () => {
  let service: CouponService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
  });

  describe('getByCode', () => {
    it('应返回优惠券', async () => {
      mockCouponFindUnique.mockResolvedValue({
        id: 'coup_001',
        code: 'LEBARAN2026',
        type: 'PERCENTAGE',
        value: 5,
        minSpend: 100000,
        status: 'ACTIVE',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        usageLimit: 1000,
        usedCount: 50,
      });

      const result = await service.getByCode('LEBARAN2026');

      expect(result).toBeDefined();
      expect(result.code).toBe('LEBARAN2026');
      expect(mockCouponFindUnique).toHaveBeenCalledWith({
        where: { code: 'LEBARAN2026' },
      });
    });
  });

  describe('claimCoupon', () => {
    it('应成功领取优惠券', async () => {
      mockCouponFindUnique.mockResolvedValue({
        id: 'coup_001',
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10,
        minSpend: 50000,
        status: 'ACTIVE',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        usageLimit: 100,
        usedCount: 5,
      });
      mockCouponUpdate.mockResolvedValue({
        id: 'coup_001',
        code: 'WELCOME10',
        usedCount: 6,
        claimedAt: new Date(),
      });

      const result = await service.claimCoupon('user_001', 'WELCOME10');

      expect(result).toBeDefined();
      expect(mockCouponUpdate).toHaveBeenCalled();
    });

    it('过期优惠券应抛出异常', async () => {
      const past = new Date(Date.now() - 86400000 * 365); // 1 year ago
      mockCouponFindUnique.mockResolvedValue({
        id: 'coup_expired',
        code: 'OLD2025',
        type: 'FIXED',
        value: 15000,
        minSpend: 100000,
        status: 'EXPIRED',    // explicit EXPIRED status
        startDate: past,
        endDate: past,        // ended in the past
        usageLimit: 100,
        usedCount: 50,
      });

      await expect(
        service.claimCoupon('user_001', 'OLD2025'),
      ).rejects.toThrow(BadRequestException);
    });

    it('超出限量应抛出异常', async () => {
      mockCouponFindUnique.mockResolvedValue({
        id: 'coup_full',
        code: 'FULL100',
        type: 'FIXED',
        value: 20000,
        minSpend: 100000,
        status: 'ACTIVE',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        usageLimit: 100,
        usedCount: 100,
      });

      await expect(
        service.claimCoupon('user_001', 'FULL100'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listUserCoupons', () => {
    it('应返回用户已领取的优惠券', async () => {
      mockCouponFindMany.mockResolvedValue([
        {
          id: 'coup_001',
          code: 'LEBARAN2026',
          type: 'PERCENTAGE',
          value: 5,
          claimedAt: new Date('2026-04-01'),
        },
        {
          id: 'coup_002',
          code: 'WELCOME10',
          type: 'PERCENTAGE',
          value: 10,
          claimedAt: new Date('2026-03-15'),
        },
      ]);

      const result = await service.listUserCoupons('user_001');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
    });
  });
});
