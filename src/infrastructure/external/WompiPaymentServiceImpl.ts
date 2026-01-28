import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { Either, left, right } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';
import {
  WompiPaymentService,
  CardData,
} from '../../application/use-cases/WompiPaymentService';
import { CENTS_PER_UNIT, DEFAULT_INSTALLMENTS } from '../../domain/constants';

interface TokenResponse {
  data: {
    id: string;
  };
}

interface TransactionResponse {
  data: {
    status: string;
  };
}

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

      const tokenResponse = await axios.post<TokenResponse>(
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

      const token = tokenResponse.data.data.id;

      const transactionResponse = await axios.post<TransactionResponse>(
        `${wompiUrl}/transactions`,
        {
          amount_in_cents: amount * CENTS_PER_UNIT, // Wompi expects cents
          currency: 'COP',
          signature: this.generateSignature(
            amount * CENTS_PER_UNIT,
            'COP',
            transactionId,
            privateKey,
          ),
          customer_email: customerEmail,
          payment_method: {
            type: 'CARD',
            token: token,
            installments: DEFAULT_INSTALLMENTS, // Assuming single payment
          },
          reference: transactionId,
        },
        {
          headers: {
            Authorization: `Bearer ${privateKey}`,
          },
        },
      );

      const status = transactionResponse.data.data.status;

      if (status === 'APPROVED') {
        return right(TransactionStatus.APPROVED);
      } else if (status === 'DECLINED') {
        return right(TransactionStatus.DECLINED);
      } else {
        return right(TransactionStatus.PENDING); // Or handle other statuses
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        'Wompi API error:',
        axiosError.response?.data || axiosError.message,
      );
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
