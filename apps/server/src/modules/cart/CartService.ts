import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: string) {
    const items = await this.prisma.aceCartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            imageUrls: true,
            priceIdr: true,
            costCny: true,
            stock: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let subtotal = 0;
    const cartItems = items.map(item => {
      const price = Number(item.product.priceIdr);
      const qty = item.quantity;
      const itemTotal = price * qty;
      subtotal += itemTotal;

      return {
        id: item.id,
        qty,
        selected: item.selected,
        product: {
          ...item.product,
          priceIdr: price,
          costCny: Number(item.product.costCny),
          images: this.parseImages(item.product.imageUrls),
        },
        itemTotal,
        inStock: item.product.status === 'ACTIVE' && (item.product.stock || 0) >= qty,
      };
    });

    return {
      items: cartItems,
      subtotal,
      count: cartItems.length,
      totalQty: cartItems.reduce((sum, i) => sum + i.qty, 0),
    };
  }

  async addToCart(userId: string, productId: string, qty: number) {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.aceProduct.findUnique({
        where: { id: productId },
        select: { id: true, stock: true, status: true, name: true },
      });

      if (!product || product.status !== 'ACTIVE') {
        throw new BadRequestException('Product not found or unavailable');
      }

      if (product.stock !== null && product.stock < qty) {
        throw new BadRequestException(`Insufficient stock. Available: ${product.stock}`);
      }

      const existing = await tx.aceCartItem.findFirst({
        where: { userId, productId },
      });

      if (existing) {
        const newQty = existing.quantity + qty;
        if (product.stock !== null && product.stock < newQty) {
          throw new BadRequestException(`Insufficient stock. Available: ${product.stock}`);
        }
        return tx.aceCartItem.update({
          where: { id: existing.id },
          data: { quantity: newQty },
        });
      }

      return tx.aceCartItem.create({
        data: { userId, productId, quantity: qty },
      });
    });
  }

  async updateCartItem(userId: string, itemId: string, qty: number) {
    const item = await this.prisma.aceCartItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!item) throw new BadRequestException('Cart item not found');

    if (qty <= 0) {
      await this.prisma.aceCartItem.delete({ where: { id: itemId } });
      return { deleted: true };
    }

    return this.prisma.aceCartItem.update({
      where: { id: itemId },
      data: { quantity: qty },
    });
  }

  async removeCartItem(userId: string, itemId: string) {
    const item = await this.prisma.aceCartItem.findFirst({
      where: { id: itemId, userId },
    });
    if (!item) throw new BadRequestException('Cart item not found');

    await this.prisma.aceCartItem.delete({ where: { id: itemId } });
    return { success: true };
  }

  async clearCart(userId: string) {
    await this.prisma.aceCartItem.deleteMany({ where: { userId } });
    return { success: true };
  }

  private parseImages(imageUrls: string | null): string[] {
    if (!imageUrls) return [];
    try {
      const parsed = JSON.parse(imageUrls);
      return Array.isArray(parsed) ? parsed : [imageUrls];
    } catch {
      return imageUrls ? [imageUrls] : [];
    }
  }
}
