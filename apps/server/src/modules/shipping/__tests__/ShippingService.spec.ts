import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ShippingService } from '../ShippingService';

const mockYuntu = {
  calculateQuote: jest.fn().mockReturnValue({
    totalCostCny: 45, chargeableWeight: 1.2, estimatedDays: '7-10', channelName: 'Yuntu Express',
    breakdown: { base: 30, fuel: 5, handling: 10 },
  }),
  calculateConsolidatedQuote: jest.fn().mockReturnValue({
    totalCostCny: 80, chargeableWeight: 2.5, estimatedDays: '7-10', channelName: 'Yuntu Consolidation',
  }),
  validateAddress: jest.fn().mockReturnValue({ valid: true, city: 'Jakarta' }),
  getEstimatedRange: jest.fn().mockReturnValue({ minCny: 25, maxCny: 120, estimatedDays: '7-10' }),
};

// Need to import the actual class to use as token
const YuntuShippingProvider = jest.requireActual('../YuntuShippingProvider').YuntuShippingProvider;

describe('ShippingService', () => {
  let service: ShippingService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShippingService,
        { provide: YuntuShippingProvider, useValue: mockYuntu },
      ],
    }).compile();

    service = module.get<ShippingService>(ShippingService);
  });

  describe('getUserQuote', () => {
    it('应返回印尼标准运费', async () => {
      const result = service.getUserQuote({
        country: 'ID',
        weightKg: 1.5,
        hasBattery: false,
        itemCount: 2,
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty('userPrice');
      expect(result.userPrice).toBeGreaterThan(0);
      expect(result.userCurrency).toBe('IDR');
    });

    it('泰国运费应使用 THB 汇率', async () => {
      const result = service.getUserQuote({
        country: 'TH',
        weightKg: 1.0,
        hasBattery: false,
        itemCount: 1,
      });

      expect(result).toBeDefined();
      expect(result.userCurrency).toBe('THB');
      expect(result.userPrice).toBeGreaterThan(0);
    });

    it('菲律宾运费应使用 PHP 汇率', async () => {
      const result = service.getUserQuote({
        country: 'PH',
        weightKg: 2.0,
        hasBattery: false,
        itemCount: 1,
      });

      expect(result).toBeDefined();
      expect(result.userCurrency).toBe('PHP');
    });
  });

  describe('getEstimateRange', () => {
    it('应返回时效估算', async () => {
      const estimate = service.getEstimateRange('ID');

      expect(estimate).toBeDefined();
      expect(estimate).toHaveProperty('minCny');
      expect(estimate).toHaveProperty('maxCny');
      expect(estimate.currency).toBe('IDR');
    });
  });
});
