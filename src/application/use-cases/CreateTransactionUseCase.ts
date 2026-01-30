import { Inject, Injectable } from '@nestjs/common';
import { TaskEither, tryCatch, chain } from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import {
  Transaction,
  TransactionStatus,
} from '../../domain/entities/Transaction';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository';
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository';

export interface CreateTransactionInput {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  productId: string | number;
  quantity: number;
}

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
  ) {}

  execute(input: CreateTransactionInput): TaskEither<Error, Transaction> {
    return pipe(
      this.validateInput(input),
      chain(() => this.checkStock(input.productId, input.quantity)),
      chain(() => this.createCustomer(input)),
      chain((customer: { id: string }) =>
        this.createTransaction(input, customer.id),
      ),
    );
  }

  private validateInput(
    input: CreateTransactionInput,
  ): TaskEither<Error, CreateTransactionInput> {
    return tryCatch(
      () => {
        // Validate productId: must exist and not be empty
        if (
          !input.productId ||
          (typeof input.productId === 'string' && input.productId.trim() === '')
        ) {
          throw new Error('productId should not be empty');
        }

        // Validate productId is a valid number
        const productIdNum = Number(input.productId);
        if (isNaN(productIdNum) || productIdNum <= 0) {
          throw new Error('productId should not be empty');
        }

        // Validate customerName
        if (!input.customerName || input.customerName.trim().length < 2) {
          throw new Error('customerName should not be empty');
        }

        // Validate customerEmail
        if (!input.customerEmail || !input.customerEmail.includes('@')) {
          throw new Error('customerEmail should not be empty');
        }

        // Validate customerAddress
        if (!input.customerAddress || input.customerAddress.trim().length < 5) {
          throw new Error('customerAddress should not be empty');
        }

        // Validate quantity
        if (
          !input.quantity ||
          input.quantity <= 0 ||
          !Number.isInteger(input.quantity)
        ) {
          throw new Error('quantity must be positive integer');
        }

        return Promise.resolve(input);
      },
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }

  private checkStock(
    productId: string | number,
    quantity: number,
  ): TaskEither<Error, void> {
    return tryCatch(
      async () => {
        const productIdNum = Number(productId);
        const product = await this.productRepository.findById(
          String(productIdNum),
        );
        if (!product) {
          throw new Error('Product not found');
        }
        if (product.stock < quantity) {
          throw new Error('Insufficient stock');
        }
      },
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }

  private createCustomer(
    input: CreateTransactionInput,
  ): TaskEither<Error, { id: string }> {
    return tryCatch(
      async () => {
        // Check if customer already exists by email
        const existingCustomer = await this.customerRepository.findByEmail(
          input.customerEmail,
        );
        if (existingCustomer) {
          return { id: existingCustomer.id };
        }

        // Create new customer if doesn't exist
        const customer = await this.customerRepository.create({
          name: input.customerName,
          email: input.customerEmail,
          address: input.customerAddress,
        });
        return { id: customer.id };
      },
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }

  private createTransaction(
    input: CreateTransactionInput,
    customerId: string,
  ): TaskEither<Error, Transaction> {
    return tryCatch(
      async () => {
        const productIdNum = Number(input.productId);
        const product = await this.productRepository.findById(
          String(productIdNum),
        );
        if (!product) {
          throw new Error('Product not found');
        }

        // Generate unique transactionId and orderId
        const timestamp = new Date()
          .toISOString()
          .replace(/[-:T.]/g, '')
          .substring(0, 14);
        const randomSuffix = Math.floor(Math.random() * 10000)
          .toString()
          .padStart(4, '0');
        const transactionId = `TXN-${timestamp}-${randomSuffix}`;
        const orderId = `ORD-${timestamp}-${randomSuffix}`;

        const transaction = await this.transactionRepository.create({
          customerId,
          productId: String(productIdNum),
          amount: product.price * input.quantity,
          status: TransactionStatus.PENDING,
          transactionId,
          orderId,
          quantity: input.quantity,
        });
        return transaction;
      },
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }
}
