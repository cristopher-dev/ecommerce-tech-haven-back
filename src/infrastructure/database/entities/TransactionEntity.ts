import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TransactionStatus } from '../../../domain/entities/Transaction';

@Entity('transactions')
export class TransactionEntity {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true, nullable: true })
  transactionId?: string;

  @Column({ unique: true, nullable: true })
  orderId?: string;

  @Column()
  customerId!: string;

  @Column('simple-json')
  items!: Array<{ productId: string; quantity: number }>;

  @Column('simple-json')
  deliveryInfo!: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    phone: string;
  };

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  baseFee!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  deliveryFee!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal!: number;

  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Backwards compatibility fields
  @Column({ nullable: true })
  productId?: string;

  @Column({ default: 1, nullable: true })
  quantity?: number;
}
