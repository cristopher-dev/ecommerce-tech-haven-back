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
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import type { TechHavenPaymentService, CardData } from './TechHavenPaymentService';
import { DEFAULT_QUANTITY } from '../../domain/constants';

@Injectable()
export class ProcessPaymentUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    @Inject('TechHavenPaymentService')
    private readonly techHavenService: TechHavenPaymentService,
  ) {}

  async execute(
    transactionId: string,
    cardData: CardData,
  ): Promise<Either<Error, Transaction>> {
    const transaction =
      await this.transactionRepository.findById(transactionId);
    if (!transaction) return left(new Error('Transaction not found'));

    const customer = await this.customerRepository.findById(
      transaction.customerId,
    );
    if (!customer) return left(new Error('Customer not found'));

    const result = await this.techHavenService.processPayment(
      transactionId,
      transaction.amount,
      cardData,
      customer.email,
    );
    if (result._tag === 'Left') return left(result.left);

    const status = result.right;
    await this.transactionRepository.updateStatus(transactionId, status);

    if (status === TransactionStatus.APPROVED) {
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
      await this.productRepository.updateStock(
        productId,
        product.stock - DEFAULT_QUANTITY,
      );
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
