import { Either } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';

export interface CardData {
  cardNumber: string;
  expirationMonth: number;
  expirationYear: number;
  cvv: string;
  cardholderName: string;
}

export interface AcceptanceTokens {
  acceptanceToken: string;
  personalDataAuthToken: string;
}

export interface TechHavenPaymentService {
  getAcceptanceTokens(): Promise<Either<Error, AcceptanceTokens>>;
  tokenizeCard(
    cardData: CardData,
  ): Promise<{
    id: string;
    created_at: string;
    brand: string;
    name: string;
    last_four: string;
    bin: string;
    exp_year: number;
    exp_month: number;
  }>;
  processPayment(
    transactionId: string,
    amount: number,
    cardData: CardData,
    customerEmail: string,
    acceptanceTokens: AcceptanceTokens,
  ): Promise<Either<Error, TransactionStatus>>;
}
