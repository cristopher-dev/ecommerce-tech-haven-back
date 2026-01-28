import { Either } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';

export interface CardData {
  number: string;
  expMonth: string;
  expYear: string;
  cvc: string;
  cardHolder: string;
}

export interface WompiPaymentService {
  processPayment(
    transactionId: string,
    amount: number,
    cardData: CardData,
    customerEmail: string,
  ): Promise<Either<Error, TransactionStatus>>;
}
