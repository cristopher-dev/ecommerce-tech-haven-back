import { Either } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';

export interface WompiPaymentService {
  processPayment(
    transactionId: string,
    amount: number,
  ): Promise<Either<Error, TransactionStatus>>;
}
