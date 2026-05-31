import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { SentinelScraper } from '../src/modules/intelligence/SentinelScraper';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const scraper = app.get(SentinelScraper);
  
  const catalogPath = path.join(__dirname, '../../../AceProxy_Jakarta_Eid_2026_Catalog.json');
  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  
  console.log(`🚀 Starting Seed for Station: ${catalog.STATION} (${catalog.SEASON})`);
  
  const categoryNames = catalog.TOP_CATEGORIES.map((c: any) => c.name);
  
  // 触发暴力采集任务
  const result = await scraper.runScraper(categoryNames);
  
  console.log('✅ Seeding Complete!');
  console.log(`📊 Total Products Injected: ${result.scrapedCount}`);
  
  await app.close();
}

seed().catch(err => {
  console.error('❌ Seed Failed:', err);
  process.exit(1);
});
