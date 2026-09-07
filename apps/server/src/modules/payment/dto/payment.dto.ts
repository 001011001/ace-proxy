import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceDto {
  @ApiProperty({ example: 'uuid-order-1', description: '订单ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 1250000, description: '金额（印尼盾）' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({ example: 'Order #ABC123 payment', description: '描述' })
  @IsString()
  description: string;
}

export class UploadProofDto {
  @ApiProperty({ example: 'uuid-order-1', description: '订单ID' })
  @IsString()
  orderId: string;

  @ApiProperty({ example: 'file:///proof.jpg', description: '支付凭证URI' })
  @IsString()
  proofUri: string;
}

export class ConfirmPaymentDto {
  @ApiProperty({ example: 'uuid-order-1', description: '订单ID' })
  @IsString()
  orderId: string;
}
