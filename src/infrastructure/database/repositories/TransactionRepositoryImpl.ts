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
    const entityData: any = {
      id: crypto.randomUUID(),
      customerId: transactionData.customerId,
      productId: transactionData.productId,
      amount: transactionData.amount,
      status: transactionData.status,
      quantity: transactionData.quantity || 1,
    };

    if (transactionData.transactionId) {
      entityData.transactionId = transactionData.transactionId;
    }
    if (transactionData.orderId) {
      entityData.orderId = transactionData.orderId;
    }

    const entity = this.transactionRepository.create(entityData);
    const savedEntity = (await this.transactionRepository.save(
      entity,
    )) as unknown as TransactionEntity;
    return new Transaction(
      savedEntity.id,
      savedEntity.customerId,
      savedEntity.productId,
      Number(savedEntity.amount),
      savedEntity.status,
      savedEntity.createdAt,
      savedEntity.updatedAt,
      savedEntity.transactionId,
      savedEntity.orderId,
      savedEntity.quantity,
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
      entity.transactionId,
      entity.orderId,
      entity.quantity,
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
          entity.transactionId,
          entity.orderId,
          entity.quantity,
        ),
    );
  }
}
