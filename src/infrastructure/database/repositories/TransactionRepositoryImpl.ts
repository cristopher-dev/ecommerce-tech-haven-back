import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionRepository } from '../../../domain/repositories/TransactionRepository';
import {
  Transaction,
  TransactionStatus,
} from '../../../domain/entities/Transaction';
import { TransactionEntity } from '../entities/TransactionEntity';

@Injectable()
export class TransactionRepositoryImpl implements TransactionRepository {
  constructor(
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  async create(
    transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Transaction> {
    const entity = this.transactionRepository.create({
      id: crypto.randomUUID(),
      customerId: transactionData.customerId,
      productId: transactionData.productId,
      amount: transactionData.amount,
      status: transactionData.status,
    });

    const savedEntity = await this.transactionRepository.save(entity);
    return new Transaction(
      savedEntity.id,
      savedEntity.customerId,
      savedEntity.productId,
      Number(savedEntity.amount),
      savedEntity.status,
      savedEntity.createdAt,
      savedEntity.updatedAt,
    );
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.transactionRepository.findOne({ where: { id } });
    if (!entity) return null;

    return new Transaction(
      entity.id,
      entity.customerId,
      entity.productId,
      Number(entity.amount),
      entity.status,
      entity.createdAt,
      entity.updatedAt,
    );
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<void> {
    await this.transactionRepository.update(id, { status });
  }

  async findAll(): Promise<Transaction[]> {
    const entities = await this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map(
      (entity) =>
        new Transaction(
          entity.id,
          entity.customerId,
          entity.productId,
          Number(entity.amount),
          entity.status,
          entity.createdAt,
          entity.updatedAt,
        ),
    );
  }
}
