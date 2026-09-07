import { IsString, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 'uuid-product-1', description: '商品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 1, description: '数量', default: 1 })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number = 1;
}

export class UpdateCartItemDto {
  @ApiProperty({ example: 'uuid-product-1', description: '商品ID' })
  @IsString()
  productId: string;

  @ApiProperty({ example: 3, description: '新数量' })
  @IsInt()
  @Min(1)
  @Max(99)
  quantity: number;
}

export class RemoveFromCartDto {
  @ApiProperty({ example: 'uuid-product-1', description: '商品ID' })
  @IsString()
  productId: string;
}
