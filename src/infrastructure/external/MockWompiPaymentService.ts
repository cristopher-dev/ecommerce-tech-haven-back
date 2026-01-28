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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _amount: number,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _cardData: CardData,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _customerEmail: string,
  ): Promise<Either<Error, TransactionStatus>> {
    try {
      const wompiUrl = this.configService.get<string>('WOMPI_SANDBOX_URL');
      const privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY');

      // Ejemplo de llamada a Wompi para verificar conectividad
      await axios.get(`${wompiUrl}/merchants/${privateKey}`, {
        headers: {
          Authorization: `Bearer ${privateKey}`,
        },
      });

      // Mock logic: approve if amount < 500, decline otherwise
      if (_amount < 500) {
        return right(TransactionStatus.APPROVED);
      } else {
        return right(TransactionStatus.DECLINED);
      }
    } catch {
      return left(new Error('Error processing payment'));
    }
  }
}
