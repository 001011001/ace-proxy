/**
 * 物流相关类型
 */
export type LogisticsNodeStatus =
  | 'ORDER_PLACED'
  | 'SUPPLIER_CONFIRMED'
  | 'IN_PRODUCTION'
  | 'SUPPLIER_SHIPPED'
  | 'WAREHOUSE_RECEIVED'
  | 'QC_PASSED'
  | 'CONSOLIDATING'
  | 'CONSOLIDATED'
  | 'INTERNATIONAL_DEPARTED'
  | 'IN_CUSTOMS'
  | 'CUSTOMS_CLEARED'
  | 'LOCAL_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'SIGNED';

export interface LogisticsNode {
  id: string;
  orderId: string;
  node: LogisticsNodeStatus;
  timestamp: string;
  location: string | null;
  note: string | null;
}

export type ParcelStatus =
  | 'IN_TRANSIT_TO_WAREHOUSE'
  | 'WAREHOUSE_ARRIVED'
  | 'QC_PENDING'
  | 'QC_PASSED'
  | 'QC_FAILED'
  | 'CONSOLIDATED'
  | 'SHIPPED';

export interface Parcel {
  id: string;
  orderId: string;
  orderItemId: string | null;
  weight: number | null;
  status: ParcelStatus;
  arrivedAt: string | null;
  qcStatus: string | null;
  qcImages: string | null;
  warehouseEntryAt: string | null;
  warehouseExitAt: string | null;
  createdAt: string;
}
