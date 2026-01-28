import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Either, left, right } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';
import {
  WompiPaymentService,
  CardData,
} from '../../application/use-cases/WompiPaymentService';

@Injectable()
export class MockWompiPaymentService implements WompiPaymentService {
  constructor(private configService: ConfigService) {}

  async processPayment(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _transactionId: string,
    amount: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _cardData: CardData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _customerEmail: string,
  ): Promise<Either<Error, TransactionStatus>> {
    // Mock logic: decline if amount >= 500, otherwise approve
    if (amount >= 500) {
      return Promise.resolve(right(TransactionStatus.DECLINED));
    }
    return Promise.resolve(right(TransactionStatus.APPROVED));
  }
}
