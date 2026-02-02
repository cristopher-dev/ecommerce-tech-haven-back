import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosError } from 'axios';
import { Either, left, right } from 'fp-ts/Either';
import { TransactionStatus } from '../../domain/entities/Transaction';
import {
  TechHavenPaymentService,
  CardData,
  AcceptanceTokens,
} from '../../application/use-cases/TechHavenPaymentService';
import { CENTS_PER_UNIT, DEFAULT_INSTALLMENTS } from '../../domain/constants';

interface AcceptanceTokensResponse {
  data: {
    presigned_acceptance: {
      acceptance_token: string;
      permalink: string;
      type: string;
    };
    presigned_personal_data_auth: {
      acceptance_token: string;
      permalink: string;
      type: string;
    };
  };
}

interface TokenResponse {
  data: {
    id: string;
  };
}

interface TransactionResponse {
  data: {
    id: string;
    status: string;
  };
}

@Injectable()
export class TechHavenPaymentServiceImpl implements TechHavenPaymentService {
  constructor(private configService: ConfigService) {}

  async getAcceptanceTokens(): Promise<Either<Error, AcceptanceTokens>> {
    try {
      const apiUrl = this.configService.get<string>('PAYMENT_API_URL')!;
      const publicKey = this.configService.get<string>('PAYMENT_PUBLIC_KEY')!;

      const response = await axios.get<AcceptanceTokensResponse>(
        `${apiUrl}/merchants/${publicKey}`,
      );

      const acceptanceToken =
        response.data.data.presigned_acceptance.acceptance_token;
      const personalDataAuthToken =
        response.data.data.presigned_personal_data_auth.acceptance_token;

      return right({
        acceptanceToken,
        personalDataAuthToken,
      });
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        'Wompi API error getting acceptance tokens:',
        axiosError.response?.data || axiosError.message,
      );
      return left(new Error('Error getting acceptance tokens from Wompi'));
    }
  }

  async processPayment(
    transactionId: string,
    amount: number,
    cardData: CardData,
    customerEmail: string,
    acceptanceTokens: AcceptanceTokens,
  ): Promise<Either<Error, TransactionStatus>> {
    try {
      const techHavenUrl = this.configService.get<string>('PAYMENT_API_URL')!;
      const publicKey = this.configService.get<string>('PAYMENT_PUBLIC_KEY')!;
      const privateKey = this.configService.get<string>('PAYMENT_PRIVATE_KEY')!;

      const tokenResponse = await axios.post<TokenResponse>(
        `${techHavenUrl}/tokens/cards`,
        {
          number: cardData.cardNumber.replace(/\s/g, ''), // Remove spaces
          exp_month: String(cardData.expirationMonth).padStart(2, '0'),
          exp_year: String(cardData.expirationYear),
          cvc: cardData.cvv,
          card_holder: cardData.cardholderName,
        },
        {
          headers: {
            Authorization: `Bearer ${publicKey}`,
          },
        },
      );

      const token = tokenResponse.data.data.id;

      const transactionResponse = await axios.post<TransactionResponse>(
        `${techHavenUrl}/transactions`,
        {
          acceptance_token: acceptanceTokens.acceptanceToken,
          accept_personal_auth: acceptanceTokens.personalDataAuthToken,
          amount_in_cents: amount * CENTS_PER_UNIT, // Wompi expects cents
          currency: 'COP',
          customer_email: customerEmail,
          reference: transactionId,
          payment_method: {
            type: 'CARD',
            token: token,
            installments: DEFAULT_INSTALLMENTS, // Assuming single payment
          },
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
        'TechHaven API error:',
        axiosError.response?.data || axiosError.message,
      );
      return left(new Error('Error processing payment with Wompi'));
    }
  }
}
