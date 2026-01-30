import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import {
  Transaction,
  TransactionStatus,
} from '../../domain/entities/Transaction';
import { TransactionRepository } from '../../domain/repositories/TransactionRepository';

@Injectable()
export class InMemoryTransactionRepository implements TransactionRepository {
  private readonly transactions: Transaction[] = [];

  async create(
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Transaction> {
    const transaction = new Transaction(
      uuidv4(),
      data.customerId,
      data.amount,
      data.status,
      data.items,
      data.deliveryInfo,
      data.baseFee,
      data.deliveryFee,
      data.subtotal,
      new Date(),
      new Date(),
      data.transactionId,
      data.orderId,
      data.productId, // backwards compatibility
      data.quantity, // backwards compatibility
    );
    this.transactions.push(transaction);
    return await Promise.resolve(transaction);
  }

  async findById(id: string): Promise<Transaction | null> {
    return await Promise.resolve(
      this.transactions.find((t) => t.id === id) || null,
    );
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<void> {
    const transaction = this.transactions.find((t) => t.id === id);
    if (transaction) {
      transaction.status = status;
      transaction.updatedAt = new Date();
    }
    await Promise.resolve();
  }

  async findAll(): Promise<Transaction[]> {
    return await Promise.resolve(this.transactions);
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<Transaction | null> {
    return await Promise.resolve(
      this.transactions.find((t) => t.transactionId === transactionId) || null,
    );
  }
}
