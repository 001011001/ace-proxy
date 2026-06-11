import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './CartService';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /** 获取购物车 */
  @Get()
  async getCart(@Req() req: any) {
    return this.cartService.getCart(req.user.sub);
  }

  /** 加入购物车 */
  @Post('add')
  async addToCart(
    @Req() req: any,
    @Body() body: { productId: string; qty?: number },
  ) {
    return this.cartService.addToCart(
      req.user.sub,
      body.productId,
      body.qty || 1,
    );
  }

  /** 修改购物车数量 */
  @Put(':itemId')
  async updateItem(
    @Req() req: any,
    @Param('itemId') itemId: string,
    @Body() body: { qty: number },
  ) {
    return this.cartService.updateCartItem(req.user.sub, itemId, body.qty);
  }

  /** 删除购物车商品 */
  @Delete(':itemId')
  async removeItem(@Req() req: any, @Param('itemId') itemId: string) {
    return this.cartService.removeCartItem(req.user.sub, itemId);
  }

  /** 清空购物车 */
  @Delete()
  async clearCart(@Req() req: any) {
    return this.cartService.clearCart(req.user.sub);
  }
}
