import { Injectable } from '@nestjs/common';
import { Either, right } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';
import {
  TechHavenPaymentService,
  CardData,
  AcceptanceTokens,
} from '../../application/use-cases/TechHavenPaymentService';
import { MOCK_DECLINE_THRESHOLD } from '../../domain/constants';

@Injectable()
export class MockTechHavenPaymentService implements TechHavenPaymentService {
  constructor() {}

  async getAcceptanceTokens(): Promise<Either<Error, AcceptanceTokens>> {
    // Mock acceptance tokens
    return Promise.resolve(right({
      acceptanceToken: 'mock_acceptance_token',
      personalDataAuthToken: 'mock_personal_auth_token',
    }));
  }

  async processPayment(
    _transactionId: string,
    amount: number,
    _cardData: CardData,
    _customerEmail: string,
    _acceptanceTokens: AcceptanceTokens,
  ): Promise<Either<Error, TransactionStatus>> {
    if (amount >= MOCK_DECLINE_THRESHOLD) {
      return Promise.resolve(right(TransactionStatus.DECLINED));
    }
    return Promise.resolve(right(TransactionStatus.APPROVED));
  }
}
