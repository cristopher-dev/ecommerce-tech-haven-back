import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Either, left, right } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';
import {
  WompiPaymentService,
  CardData,
} from '../../application/use-cases/WompiPaymentService';

@Injectable()
export class WompiPaymentServiceImpl implements WompiPaymentService {
  constructor(private configService: ConfigService) {}

  async processPayment(
    transactionId: string,
    amount: number,
    cardData: CardData,
    customerEmail: string,
  ): Promise<Either<Error, TransactionStatus>> {
    try {
      const wompiUrl = this.configService.get<string>('WOMPI_SANDBOX_URL')!;
      const publicKey = this.configService.get<string>('WOMPI_PUBLIC_KEY')!;
      const privateKey = this.configService.get<string>('WOMPI_PRIVATE_KEY')!;

      // Step 1: Tokenize the card
      const tokenResponse = await axios.post(
        `${wompiUrl}/tokens/cards`,
        {
          number: cardData.number.replace(/\s/g, ''), // Remove spaces
          exp_month: cardData.expMonth,
          exp_year: cardData.expYear,
          cvc: cardData.cvc,
          card_holder: cardData.cardHolder,
        },
        {
          headers: {
            Authorization: `Bearer ${publicKey}`,
          },
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const token = tokenResponse.data.data.id;

      // Step 2: Create transaction
      const transactionResponse = await axios.post(
        `${wompiUrl}/transactions`,
        {
          amount_in_cents: amount * 100, // Wompi expects cents
          currency: 'COP',
          signature: this.generateSignature(
            amount * 100,
            'COP',
            transactionId,
            privateKey,
          ),
          customer_email: customerEmail,
          payment_method: {
            type: 'CARD',
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            token: token,
            installments: 1, // Assuming single payment
          },
          reference: transactionId,
        },
        {
          headers: {
            Authorization: `Bearer ${privateKey}`,
          },
        },
      );

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const status = transactionResponse.data.data.status;

      if (status === 'APPROVED') {
        return right(TransactionStatus.APPROVED);
      } else if (status === 'DECLINED') {
        return right(TransactionStatus.DECLINED);
      } else {
        return right(TransactionStatus.PENDING); // Or handle other statuses
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('Wompi API error:', error.response?.data || error.message);
      return left(new Error('Error processing payment with Wompi'));
    }
  }

  private generateSignature(
    amount: number,
    currency: string,
    reference: string,
    privateKey: string,
  ): string {
    const data = `${amount}${currency}${reference}${privateKey}`;
    return createHash('sha256').update(data).digest('hex');
  }
}
