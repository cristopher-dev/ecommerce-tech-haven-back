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
      items: transactionData.items,
      deliveryInfo: transactionData.deliveryInfo,
      amount: transactionData.amount,
      baseFee: transactionData.baseFee,
      deliveryFee: transactionData.deliveryFee,
      subtotal: transactionData.subtotal,
      status: transactionData.status,
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
    return this.mapEntityToTransaction(savedEntity);
  }

  async findById(id: string): Promise<Transaction | null> {
    const entity = await this.transactionRepository.findOne({ where: { id } });
    if (!entity) return null;
    return this.mapEntityToTransaction(entity);
  }

  async updateStatus(id: string, status: TransactionStatus): Promise<void> {
    await this.transactionRepository.update(id, { status });
  }

  async findAll(): Promise<Transaction[]> {
    const entities = await this.transactionRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map((entity) => this.mapEntityToTransaction(entity));
  }

  async findByTransactionId(
    transactionId: string,
  ): Promise<Transaction | null> {
    const entity = await this.transactionRepository.findOne({
      where: { transactionId },
    });
    if (!entity) return null;
    return this.mapEntityToTransaction(entity);
  }

  private mapEntityToTransaction(entity: TransactionEntity): Transaction {
    return new Transaction(
      entity.id,
      entity.customerId,
      Number(entity.amount),
      entity.status,
      entity.items || [],
      entity.deliveryInfo,
      Number(entity.baseFee),
      Number(entity.deliveryFee),
      Number(entity.subtotal),
      entity.createdAt,
      entity.updatedAt,
      entity.transactionId,
      entity.orderId,
      entity.productId, // backwards compatibility
      entity.quantity, // backwards compatibility
    );
  }
}
