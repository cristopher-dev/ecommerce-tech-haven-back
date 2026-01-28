import { Transaction, TransactionStatus } from '../entities/Transaction';

export interface TransactionRepository {
  create(
    transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Transaction>;
  findById(id: string): Promise<Transaction | null>;
  updateStatus(id: string, status: TransactionStatus): Promise<void>;
  findAll(): Promise<Transaction[]>;
}
