import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ProductService } from '../ProductService';
import { PrismaService } from '../../../prisma/prisma.service';

// Mock PrismaService
const mockPrisma = {
  aceProduct: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    groupBy: jest.fn(),
    count: jest.fn(),
    updateMany: jest.fn(),
  },
};

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    jest.clearAllMocks();

    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    service = module.get<ProductService>(ProductService);
  });

  describe('decrementStockWithRetry', () => {
    it('should return true when stock is sufficient and decrement succeeds', async () => {
      mockPrisma.aceProduct.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.decrementStockWithRetry('prod_001', 3);

      expect(result).toBe(true);
      expect(mockPrisma.aceProduct.updateMany).toHaveBeenCalledWith({
        where: { id: 'prod_001', stock: { gte: 3 } },
        data: { stock: { decrement: 3 } },
      });
    });

    it('should return false when stock is insufficient', async () => {
      mockPrisma.aceProduct.updateMany.mockResolvedValue({ count: 0 });

      const result = await service.decrementStockWithRetry('prod_002', 100);

      expect(result).toBe(false);
    });

    it('should retry on transient errors up to MAX_RETRIES', async () => {
      // Fail twice, succeed on third attempt
      mockPrisma.aceProduct.updateMany
        .mockRejectedValueOnce(new Error('Connection timeout'))
        .mockRejectedValueOnce(new Error('Deadlock'))
        .mockResolvedValueOnce({ count: 1 });

      const result = await service.decrementStockWithRetry('prod_003', 1);

      expect(result).toBe(true);
      expect(mockPrisma.aceProduct.updateMany).toHaveBeenCalledTimes(3);
    });
  });
});
