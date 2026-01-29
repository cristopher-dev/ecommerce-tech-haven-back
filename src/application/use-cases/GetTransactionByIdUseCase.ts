import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { Transaction } from '../../domain/entities/Transaction';
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository';

@Injectable()
export class GetTransactionByIdUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(id: string): Promise<Either<Error, Transaction>> {
    try {
      const transaction = await this.transactionRepository.findById(id);
      if (!transaction) {
        return left(new Error(`Transaction with id ${id} not found`));
      }
      return right(transaction);
    } catch (error) {
      return left(error as Error);
    }
  }
}
