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

  @Column()
  productId!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount!: number;

  @Column({ default: 1 })
  quantity!: number;

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
}
