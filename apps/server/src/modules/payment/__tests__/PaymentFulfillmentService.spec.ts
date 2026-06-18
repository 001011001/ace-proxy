import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { PaymentFulfillmentService } from '../PaymentFulfillmentService';
import { ProductService } from '../../product/ProductService';
import { PrismaService } from '../../../prisma/prisma.service';

// Mock PrismaService
const mockPrisma = {
  aceOrder: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  aceVaultLedger: {
    create: jest.fn(),
  },
  acePartner: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn(),
};

// Mock ProductService
const mockProductService = {
  decrementStockWithRetry: jest.fn().mockResolvedValue(true),
};

describe('PaymentFulfillmentService', () => {
  let service: PaymentFulfillmentService;

  beforeEach(async () => {
    jest.clearAllMocks();

    // Suppress Logger output in tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentFulfillmentService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ProductService, useValue: mockProductService },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    service = module.get<PaymentFulfillmentService>(PaymentFulfillmentService);
  });

  describe('fulfill', () => {
    it('should return success for already PAID order (idempotency)', async () => {
      mockPrisma.aceOrder.findUnique.mockResolvedValue({
        id: 'ord_test_001',
        status: 'PAID',
        totalAmount: 100000,
        partnerId: null,
      });

      const result = await service.fulfill('ord_test_001', {
        id: 'inv_001',
        amount: 100000,
        payment_method: 'OVO',
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('Already processed');
      // Transaction should NOT be called for idempotent case
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should reject order when amount mismatch exceeds 1% tolerance', async () => {
      mockPrisma.aceOrder.findUnique.mockResolvedValue({
        id: 'ord_test_002',
        status: 'PENDING',
        totalAmount: 100000,
        partnerId: null,
      });

      const result = await service.fulfill('ord_test_002', {
        id: 'inv_002',
        amount: 85000, // 15% off — exceeds 1% tolerance
        payment_method: 'DANA',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Amount mismatch');
      expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    });

    it('should successfully fulfill a valid order', async () => {
      mockPrisma.aceOrder.findUnique.mockResolvedValue({
        id: 'ord_test_003',
        status: 'PENDING',
        totalAmount: 100000,
        partnerId: null,
        items: [],
      });

      // $transaction: call the callback with a mock tx
      mockPrisma.$transaction.mockImplementation(async (fn: Function) => {
        const tx = {
          aceOrder: { update: jest.fn().mockResolvedValue({}) },
          aceVaultLedger: { create: jest.fn().mockResolvedValue({}) },
          acePartner: { findUnique: jest.fn(), update: jest.fn() },
        };
        return fn(tx);
      });

      const result = await service.fulfill('ord_test_003', {
        id: 'inv_003',
        amount: 100000,
        payment_method: 'QRIS',
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('fulfilled');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
