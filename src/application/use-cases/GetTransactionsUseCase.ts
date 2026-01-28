import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { Transaction } from '../../domain/entities/Transaction';
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository';

@Injectable()
export class GetTransactionsUseCase {
  constructor(
    @Inject('TransactionRepository')
    private readonly transactionRepository: TransactionRepository,
  ) {}

  async execute(): Promise<Either<Error, Transaction[]>> {
    try {
      const transactions = await this.transactionRepository.findAll();
      return right(transactions);
    } catch (error) {
      return left(error as Error);
    }
  }
}
