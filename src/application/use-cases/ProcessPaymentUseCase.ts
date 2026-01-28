import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import {
  Transaction,
  TransactionStatus,
} from '../../domain/entities/Transaction';
import { DeliveryStatus } from '../../domain/entities/Delivery';
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository';
import type { DeliveryRepository } from '../../domain/repositories/DeliveryRepository';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';
import type { WompiPaymentService } from './WompiPaymentService';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('WompiPaymentService')
    private readonly wompiService: WompiPaymentService,
  ) {}

  async execute(transactionId: string): Promise<Either<Error, Transaction>> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) return left(new Error('Transaction not found'));

    const result = await this.wompiService.processPayment(
      transactionId,
      transaction.amount,
    );
    if (result._tag === 'Left') return left(result.left);

    const status = result.right;
    await this.transactionRepository.updateStatus(transactionId, status);

    if (status === TransactionStatus.APPROVED) {
      // Update stock and assign delivery
      await this.updateStock(transaction.productId);
      await this.assignDelivery(transaction);
    }

    const updatedTransaction =
      await this.transactionRepository.findById(transactionId);
    return updatedTransaction
      ? right(updatedTransaction)
      : left(new Error('Transaction not found after update'));
  }

  private async updateStock(productId: string): Promise<void> {
    const product = await this.productRepository.findById(productId);
    if (product) {
      await this.productRepository.updateStock(productId, product.stock - 1); // Assuming quantity 1 for simplicity
    }
  }

  private async assignDelivery(transaction: Transaction): Promise<void> {
    await this.deliveryRepository.create({
      transactionId: transaction.id,
      customerId: transaction.customerId,
      status: DeliveryStatus.PENDING,
    });
  }
}
