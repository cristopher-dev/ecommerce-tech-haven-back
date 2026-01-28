import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';
import { DeliveryStatus } from '../../../domain/entities/Delivery';

@Entity('deliveries')
export class DeliveryEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  transactionId: string;

  @Column()
  customerId: string;

  @Column({
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @CreateDateColumn()
  createdAt: Date;
}
