export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
}

export interface TransactionItem {
  productId: string;
  quantity: number;
}

export interface DeliveryInfoData {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly amount: number,
    public status: TransactionStatus,
    public readonly items: TransactionItem[],
    public readonly deliveryInfo: DeliveryInfoData,
    public readonly baseFee: number,
    public readonly deliveryFee: number,
    public readonly subtotal: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public readonly transactionId?: string,
    public readonly orderId?: string,
    // Keep for backwards compatibility
    public readonly productId?: string,
    public readonly quantity?: number,
  ) {}
}
