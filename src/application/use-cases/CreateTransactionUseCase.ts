import { Inject, Injectable } from '@nestjs/common';
import { TaskEither, tryCatch, chain } from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import {
  Transaction,
  TransactionStatus,
  TransactionItem,
  DeliveryInfoData,
} from '../../domain/entities/Transaction';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository';
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository';

export interface CreateTransactionInput {
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  deliveryInfo: DeliveryInfoData;
  items: Array<{ productId: string; quantity: number }>;
}

// Constants for fees
const BASE_FEE = 50.0;
const DELIVERY_FEE = 100.0;

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
      chain(() => this.checkAllStocks(input.items)),
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
        // Validate items array
        if (
          !input.items ||
          !Array.isArray(input.items) ||
          input.items.length === 0
        ) {
          throw new Error('items array cannot be empty');
        }

        // Validate each item
        for (const item of input.items) {
          if (!item.productId || String(item.productId).trim() === '') {
            throw new Error('productId should not be empty');
          }
          if (
            !item.quantity ||
            item.quantity <= 0 ||
            !Number.isInteger(item.quantity)
          ) {
            throw new Error('quantity must be positive integer');
          }
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

        // Validate deliveryInfo
        if (!input.deliveryInfo) {
          throw new Error('deliveryInfo should not be empty');
        }
        const { firstName, lastName, address, city, state, postalCode, phone } =
          input.deliveryInfo;
        if (
          !firstName ||
          !lastName ||
          !address ||
          !city ||
          !state ||
          !postalCode ||
          !phone
        ) {
          throw new Error('deliveryInfo is incomplete');
        }

        return Promise.resolve(input);
      },
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }

  private checkAllStocks(
    items: Array<{ productId: string; quantity: number }>,
  ): TaskEither<Error, void> {
    return tryCatch(
      async () => {
        for (const item of items) {
          const product = await this.productRepository.findById(
            String(item.productId),
          );
          if (!product) {
            throw new Error(`Product '${item.productId}' not found`);
          }
          if (product.stock < item.quantity) {
            throw new Error(
              `Insufficient stock for product '${item.productId}'`,
            );
          }
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
        // Prepare transaction items
        const transactionItems: TransactionItem[] = input.items.map((item) => ({
          productId: String(item.productId),
          quantity: item.quantity,
        }));

        // Calculate total amount
        let subtotal = 0;
        for (const item of input.items) {
          const product = await this.productRepository.findById(
            String(item.productId),
          );
          if (product) {
            subtotal += product.price * item.quantity;
          }
        }

        const amount = subtotal + BASE_FEE + DELIVERY_FEE;

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
          amount,
          status: TransactionStatus.PENDING,
          items: transactionItems,
          deliveryInfo: input.deliveryInfo,
          baseFee: BASE_FEE,
          deliveryFee: DELIVERY_FEE,
          subtotal,
          transactionId,
          orderId,
        });
        return transaction;
      },
      (error) => (error instanceof Error ? error : new Error(String(error))),
    );
  }
}
