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
  productId: string;
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
    if (
      !input.customerName ||
      !input.customerEmail ||
      !input.productId ||
      input.quantity <= 0
    ) {
      return tryCatch(
        () => Promise.reject(new Error('Invalid input')),
        () => new Error('Invalid input'),
      );
    }
    return tryCatch(
      () => Promise.resolve(input),
      () => new Error('Unexpected error'),
    );
  }

  private checkStock(
    productId: string,
    quantity: number,
  ): TaskEither<Error, void> {
    return tryCatch(
      async () => {
        const product = await this.productRepository.findById(productId);
        if (!product || product.stock < quantity) {
          throw new Error('Insufficient stock');
        }
      },
      () => new Error('Stock check failed'),
    );
  }

  private createCustomer(
    input: CreateTransactionInput,
  ): TaskEither<Error, { id: string }> {
    return tryCatch(
      async () => {
        const customer = await this.customerRepository.create({
          name: input.customerName,
          email: input.customerEmail,
          address: input.customerAddress,
        });
        return { id: customer.id };
      },
      () => new Error('Customer creation failed'),
    );
  }

  private createTransaction(
    input: CreateTransactionInput,
    customerId: string,
  ): TaskEither<Error, Transaction> {
    return tryCatch(
      async () => {
        const product = await this.productRepository.findById(input.productId);
        if (!product) throw new Error('Product not found');

        const transaction = await this.transactionRepository.create({
          customerId,
          productId: input.productId,
          amount: product.price * input.quantity,
          status: TransactionStatus.PENDING,
        });
        return transaction;
      },
      () => new Error('Transaction creation failed'),
    );
  }
}
