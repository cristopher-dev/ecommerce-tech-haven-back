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
      data.productId,
      data.amount,
      data.status,
      new Date(),
      new Date(),
    );
    this.transactions.push(transaction);
    return transaction;
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.find((t) => t.id === id) || null;
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<void> {
    const transaction = this.transactions.find((t) => t.id === id);
    if (transaction) {
      transaction.status = status;
      transaction.updatedAt = new Date();
    }
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactions;
  }
}
