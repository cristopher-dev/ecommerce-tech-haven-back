export enum DeliveryStatus {
  PENDING = 'PENDING',
  ASSIGNED = 'ASSIGNED',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}

export class Delivery {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly customerId: string,
    public status: DeliveryStatus,
    public readonly createdAt: Date,
  ) {}
}
