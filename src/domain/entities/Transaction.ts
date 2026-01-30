export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DECLINED = 'DECLINED',
}

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly customerId: string,
    public readonly productId: string,
    public readonly amount: number,
    public status: TransactionStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public readonly transactionId?: string,
    public readonly orderId?: string,
    public readonly quantity?: number,
  ) {}
}
