import { Test, TestingModule } from '@nestjs/testing';
import { Logger, BadRequestException } from '@nestjs/common';
import { CartService } from '../CartService';
import { PrismaService } from '../../../prisma/prisma.service';

const mockCartFindMany = jest.fn();
const mockCartFindFirst = jest.fn();
const mockCartCreate = jest.fn();
const mockCartUpdate = jest.fn();
const mockCartDelete = jest.fn();
const mockCartDeleteMany = jest.fn();
const mockProductFindUnique = jest.fn();

const mockTx = jest.fn();

const mockPrisma = {
  aceCartItem: {
    findMany: mockCartFindMany,
    findFirst: mockCartFindFirst,
    create: mockCartCreate,
    update: mockCartUpdate,
    delete: mockCartDelete,
    deleteMany: mockCartDeleteMany,
  },
  aceProduct: {
    findUnique: mockProductFindUnique,
  },
  $transaction: mockTx,
};

describe('CartService', () => {
  let service: CartService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    mockTx.mockImplementation((cb: any) => {
      if (typeof cb === 'function') return cb(mockPrisma);
      return Promise.all(cb.map((fn: any) => fn()));
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  describe('addToCart', () => {
    it('应正常添加商品到购物车', async () => {
      mockProductFindUnique.mockResolvedValue({
        id: 'prod_001',
        name: 'Test Product',
        stock: 100,
        status: 'ACTIVE',
      });
      mockCartFindFirst.mockResolvedValue(null);
      mockCartCreate.mockResolvedValue({
        id: 'cart_001',
        userId: 'user_001',
        productId: 'prod_001',
        quantity: 2,
      });

      const result = await service.addToCart('user_001', 'prod_001', 2);

      expect(result).toBeDefined();
      expect(result.quantity).toBe(2);
    });

    it('库存不足时应抛出异常', async () => {
      mockProductFindUnique.mockResolvedValue({
        id: 'prod_low',
        name: 'Low Product',
        stock: 5,
        status: 'ACTIVE',
      });

      await expect(
        service.addToCart('user_001', 'prod_low', 100),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getCart', () => {
    it('应返回购物车内容', async () => {
      mockCartFindMany.mockResolvedValue([
        {
          id: 'cart_001',
          quantity: 2,
          selected: true,
          product: {
            id: 'prod_001',
            name: 'Test Product',
            imageUrls: '["https://img.example.com/p1.jpg"]',
            priceIdr: 250000,
            costCny: 120,
            stock: 100,
            status: 'ACTIVE',
          },
        },
      ]);

      const result = await service.getCart('user_001');

      expect(result).toBeDefined();
      expect(result.items).toHaveLength(1);
      expect(result.subtotal).toBe(500000);
    });
  });

  describe('removeCartItem', () => {
    it('应正常移除购物车商品', async () => {
      mockCartFindFirst.mockResolvedValue({
        id: 'cart_001',
        userId: 'user_001',
        productId: 'prod_001',
      });
      mockCartDelete.mockResolvedValue({ id: 'cart_001' });

      const result = await service.removeCartItem('user_001', 'cart_001');

      expect(result.success).toBe(true);
      expect(mockCartDelete).toHaveBeenCalledWith({
        where: { id: 'cart_001' },
      });
    });
  });
});
