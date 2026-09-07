import { Module } from '@nestjs/common';
import { CartController } from './CartController';
import { CartService } from './CartService';
import { CartConsolidationService } from './CartConsolidationService';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CartController],
  providers: [CartService, CartConsolidationService],
  exports: [CartService],
})
export class CartModule {}
