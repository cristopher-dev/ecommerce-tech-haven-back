import { Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';
import { WompiPaymentService } from '../../application/use-cases/WompiPaymentService';

@Injectable()
export class MockWompiPaymentService implements WompiPaymentService {
  async processPayment(
    transactionId: string,
    amount: number,
  ): Promise<Either<Error, TransactionStatus>> {
    // Mock: approve if amount < 500, decline otherwise
    if (amount < 500) {
      return right(TransactionStatus.APPROVED);
    } else {
      return right(TransactionStatus.DECLINED);
    }
  }
}
