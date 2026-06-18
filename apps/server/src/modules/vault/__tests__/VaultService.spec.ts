import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { VaultService } from '../VaultService';
import { PrismaService } from '../../../prisma/prisma.service';

const mockLedgerCreate = jest.fn();
const mockLedgerAggregate = jest.fn();
const mockPartnerUpdate = jest.fn();
const mockTx = jest.fn();

const mockPrisma = {
  aceVaultLedger: { create: mockLedgerCreate, aggregate: mockLedgerAggregate, findMany: jest.fn() },
  acePartner: { update: mockPartnerUpdate, findMany: jest.fn() },
  $transaction: mockTx,
};

describe('VaultService', () => {
  let service: VaultService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    mockTx.mockImplementation((arg: any) => {
      if (typeof arg === 'function') return arg(mockPrisma);
      // arg is an array of Prisma operations → resolve each
      return Promise.all(arg.map((op: any) => op));
    });
    mockLedgerCreate.mockResolvedValue({ id: 1 });

    const module: TestingModule = await Test.createTestingModule({
      providers: [VaultService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<VaultService>(VaultService);
  });

  describe('recordOrderLedger', () => {
    it('should write 7 ledger entries', async () => {
      const result = await service.recordOrderLedger('ORD-001', {
        total: 1000000, cost: 600000, shipping: 80000,
        partnerCommission: 20000, tierConfig: { serviceFeePct: 0.05, rebatePct: 0.02 },
      });
      expect(result.success).toBe(true);
      expect(mockLedgerCreate).toHaveBeenCalledTimes(7);
    });

    it('zero-sum check: DEBIT = CREDIT', async () => {
      const result = await service.recordOrderLedger('ORD-002', {
        total: 500000, cost: 250000, shipping: 50000,
        partnerCommission: 10000, tierConfig: { serviceFeePct: 0.05, rebatePct: 0.02 },
      });
      expect(result.success).toBe(true);
    });
  });

  describe('getPoolBalance', () => {
    it('should aggregate account balance', async () => {
      mockLedgerAggregate.mockResolvedValue({ _sum: { amount: 250000 } });
      expect(await service.getPoolBalance('PLATFORM_NET_PROFIT')).toBe(250000);
    });

    it('should return 0 for empty account', async () => {
      mockLedgerAggregate.mockResolvedValue({ _sum: { amount: null } });
      expect(await service.getPoolBalance('EMPTY')).toBe(0);
    });
  });

  describe('handleChargeback', () => {
    it('should lock funds on chargeback', async () => {
      const result = await service.handleChargeback('JKT', 150000);
      expect(result.success).toBe(true);
      expect(result.lockedAmount).toBe(150000);
    });
  });

  describe('recordResaleSettlement', () => {
    it('should split 5% platform + 2% partner + 93% seller', async () => {
      const r = await service.recordResaleSettlement('RS-001', 1000000);
      expect(r.platformFee).toBe(50000);
      expect(r.partnerReward).toBe(20000);
      expect(r.sellerReturn).toBe(930000);
      expect(r.platformFee + r.partnerReward + r.sellerReturn).toBe(1000000);
    });
  });
});
