import { Injectable } from '@nestjs/common';
import { Either, right } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';
import {
  TechHavenPaymentService,
  CardData,
} from '../../application/use-cases/TechHavenPaymentService';
import { MOCK_DECLINE_THRESHOLD } from '../../domain/constants';

@Injectable()
export class MockTechHavenPaymentService implements TechHavenPaymentService {
  constructor() {}

  async processPayment(
    _transactionId: string,
    amount: number,

    _cardData: CardData,

    _customerEmail: string,
  ): Promise<Either<Error, TransactionStatus>> {
    if (amount >= MOCK_DECLINE_THRESHOLD) {
      return Promise.resolve(right(TransactionStatus.DECLINED));
    }
    return Promise.resolve(right(TransactionStatus.APPROVED));
  }
}
