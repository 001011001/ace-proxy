import { Injectable } from '@nestjs/common';

/**
 * HolidayPredictorService - 全球节日预测引擎
 * 核心逻辑：提前 45 天识别区域节日，自动切换货盘权重。
 */
@Injectable()
export class HolidayPredictorService {
  private readonly holidays = [
    { name: 'Ramadan/Idul Fitri', region: 'JKT', date: '2026-03-20', leadDays: 47, categories: ['Apparel', 'Home Decor', 'Gifts'] }, // 3月20日开斋节，倒推47天为2月1日
    { name: 'Christmas', region: 'LDN', date: '2026-12-25', leadDays: 60, categories: ['Toys', 'Decorations', 'Electronics'] },
    { name: 'Harbolnas 12.12', region: 'JKT', date: '2026-12-12', leadDays: 30, categories: ['All'] },
  ];

  /**
   * 获取当前区域的主推品类
   */
  async getActiveCategories(regionId: string): Promise<string[]> {
    const now = new Date();
    const activeHoliday = this.holidays.find(h => {
      const holidayDate = new Date(h.date);
      const startTrigger = new Date(holidayDate);
      startTrigger.setDate(holidayDate.getDate() - h.leadDays);
      
      return h.region === regionId && now >= startTrigger && now <= holidayDate;
    });

    return activeHoliday ? activeHoliday.categories : ['Daily Essentials']; // 默认推日常爆款
  }
}
