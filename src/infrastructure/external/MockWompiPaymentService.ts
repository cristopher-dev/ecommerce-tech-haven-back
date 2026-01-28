import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Either, right } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';
import {
  WompiPaymentService,
  CardData,
} from '../../application/use-cases/WompiPaymentService';

@Injectable()
export class MockWompiPaymentService implements WompiPaymentService {
  constructor(private configService: ConfigService) {}

  async processPayment(
    _transactionId: string,
    amount: number,

    _cardData: CardData,

    _customerEmail: string,
  ): Promise<Either<Error, TransactionStatus>> {
    if (amount >= 500) {
      return Promise.resolve(right(TransactionStatus.DECLINED));
    }
    return Promise.resolve(right(TransactionStatus.APPROVED));
  }
}
