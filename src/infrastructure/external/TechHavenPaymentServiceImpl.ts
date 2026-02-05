import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { left, right } from 'fp-ts/Either';
import { Either } from 'fp-ts/Either';
import {
  TechHavenPaymentService,
  CardData,
  AcceptanceTokens,
} from '../../application/use-cases/TechHavenPaymentService';
import { TransactionStatus } from '../../domain/entities/Transaction';

// Wompi API Response Types
interface WompiTransaction {
  id: string;
  reference: string;
  amount_in_cents: number;
  currency: string;
  status: string;
  payment_method: {
    type: string;
    extra: any;
  };
  customer_email: string;
  merchant_public_key: string;
}

interface WompiTokenCardResponse {
  data: {
    id: string;
    created_at: string;
    brand: string;
    name: string;
    last_four: string;
    bin: string;
    exp_year: number;
    exp_month: number;
  };
}

interface WompiTokenNequiResponse {
  data: {
    id: string;
    created_at: string;
    phone_number: string;
  };
}

interface WompiPaymentSource {
  id: string;
  type: string;
  public_data: any;
  meta: any;
}

interface WompiPaymentLink {
  id: string;
  name: string;
  description: string;
  redirect_url: string;
  amount_in_cents: number;
  currency: string;
  status: string;
  created_at: string;
}

interface WompiMerchant {
  id: number;
  name: string;
  email: string;
  public_key: string;
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
}

interface WompiFinancialInstitution {
  code: string;
  name: string;
}

@Injectable()
export class TechHavenPaymentServiceImpl implements TechHavenPaymentService {
  private readonly baseUrl: string;
  private merchantPublicKey: string;
  private merchantPrivateKey: string;
  private paymentServiceType: string;

  constructor(private readonly httpService: HttpService) {
    // Load from environment variables
    this.baseUrl = process.env['TECH_HAVEN_SANDBOX_URL'] || '';
    this.merchantPublicKey = process.env['TECH_HAVEN_PUBLIC_KEY'] || '';
    this.merchantPrivateKey = process.env['TECH_HAVEN_PRIVATE_KEY'] || '';
    this.paymentServiceType = process.env['PAYMENT_SERVICE_TYPE'] || 'mock';
  }

  /**
   * Get Acceptance Tokens from merchant
   */
  async getAcceptanceTokens(): Promise<Either<Error, AcceptanceTokens>> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ data: WompiMerchant }>(
          `${this.baseUrl}/merchants/${this.merchantPublicKey}`,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right({
        acceptanceToken:
          response.data.data.presigned_acceptance.acceptance_token,
        personalDataAuthToken:
          response.data.data.presigned_personal_data_auth.acceptance_token,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(
        new Error(`Failed to get acceptance tokens: ${errorMessage}`),
      );
    }
  }

  /**
   * Process Payment - Create transaction and charge card
   */
  async processPayment(
    transactionId: string,
    amount: number,
    cardData: CardData,
    customerEmail: string,
    acceptanceTokens: AcceptanceTokens,
  ): Promise<Either<Error, TransactionStatus>> {
    // Check if using mock service
    if (this.paymentServiceType === 'mock') {
      // Simulate successful payment for testing
      return right(TransactionStatus.APPROVED);
    }

    try {
      // First tokenize the card
      const cardTokenData = await this.tokenizeCard(cardData);
      const cardToken = cardTokenData.id;

      // Create transaction with tokenized card
      const transactionResult = await this.createTransaction(
        transactionId,
        amount,
        cardToken,
        customerEmail,
        acceptanceTokens,
      );

      if (transactionResult._tag === 'Left') {
        return left(transactionResult.left);
      }

      const transaction = transactionResult.right;

      // Map Wompi status to our TransactionStatus
      const status = this.mapWompiStatusToTransactionStatus(transaction.status);
      return right(status);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Payment processing failed: ${errorMessage}`));
    }
  }

  /**
   * Tokenize Credit Card
   * POST /tokens/cards
   */
  async tokenizeCard(
    cardData: CardData,
  ): Promise<WompiTokenCardResponse['data']> {
    try {
      const payload = {
        number: cardData.cardNumber.replace(/\s/g, ''),
        exp_month: String(cardData.expirationMonth),
        exp_year: String(cardData.expirationYear),
        cvc: cardData.cvv,
        card_holder: cardData.cardholderName,
      };

      const response = await lastValueFrom(
        this.httpService.post<WompiTokenCardResponse>(
          `${this.baseUrl}/tokens/cards`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.merchantPublicKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      return response.data.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new Error(`Card tokenization failed: ${errorMessage}`);
    }
  }

  /**
   * Get Transaction
   * GET /transactions/{transaction_id}
   */
  async getTransaction(
    transactionId: string,
  ): Promise<Either<Error, WompiTransaction>> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ data: WompiTransaction }>(
          `${this.baseUrl}/transactions/${transactionId}`,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Failed to get transaction: ${errorMessage}`));
    }
  }

  /**
   * Search Transactions
   * GET /transactions
   */
  async getTransactions(params?: {
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<Either<Error, WompiTransaction[]>> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ data: WompiTransaction[] }>(
          `${this.baseUrl}/transactions`,
          {
            headers: this.getHeaders(),
            params,
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Failed to get transactions: ${errorMessage}`));
    }
  }

  /**
   * Create Transaction
   * POST /transactions
   */
  async createTransaction(
    reference: string,
    amountInCents: number,
    cardTokenId: string,
    customerEmail: string,
    acceptanceTokens: AcceptanceTokens,
  ): Promise<Either<Error, WompiTransaction>> {
    try {
      const payload = {
        amount_in_cents: amountInCents,
        currency: 'COP',
        customer_email: customerEmail,
        payment_method: {
          type: 'CARD',
          installments: 1,
          token: cardTokenId,
        },
        reference,
        acceptance_token: acceptanceTokens.acceptanceToken,
        personal_data_auth_token: acceptanceTokens.personalDataAuthToken,
      };

      const response = await lastValueFrom(
        this.httpService.post<{ data: WompiTransaction }>(
          `${this.baseUrl}/transactions`,
          payload,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Failed to create transaction: ${errorMessage}`));
    }
  }

  /**
   * Void/Cancel Transaction
   * POST /transactions/{transaction_id}/void
   */
  async voidTransaction(
    transactionId: string,
  ): Promise<Either<Error, WompiTransaction>> {
    try {
      const response = await lastValueFrom(
        this.httpService.post<{ data: WompiTransaction }>(
          `${this.baseUrl}/transactions/${transactionId}/void`,
          {},
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Failed to void transaction: ${errorMessage}`));
    }
  }

  /**
   * Tokenize Nequi Account
   * POST /tokens/nequi
   */
  async tokenizeNequi(phoneNumber: string): Promise<Either<Error, string>> {
    try {
      const payload = {
        phone_number: phoneNumber,
      };

      const response = await lastValueFrom(
        this.httpService.post<WompiTokenNequiResponse>(
          `${this.baseUrl}/tokens/nequi`,
          payload,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data.id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Nequi tokenization failed: ${errorMessage}`));
    }
  }

  /**
   * Get Nequi Token Info
   * GET /tokens/nequi/{token_id}
   */
  async getNequiToken(
    tokenId: string,
  ): Promise<Either<Error, WompiTokenNequiResponse['data']>> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<WompiTokenNequiResponse>(
          `${this.baseUrl}/tokens/nequi/${tokenId}`,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Failed to get Nequi token: ${errorMessage}`));
    }
  }

  /**
   * Create Payment Source
   * POST /payment_sources
   */
  async createPaymentSource(payload: {
    type: string;
    token: string;
    customer_email: string;
  }): Promise<Either<Error, WompiPaymentSource>> {
    try {
      const response = await lastValueFrom(
        this.httpService.post<{ data: WompiPaymentSource }>(
          `${this.baseUrl}/payment_sources`,
          payload,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(
        new Error(`Failed to create payment source: ${errorMessage}`),
      );
    }
  }

  /**
   * Get Payment Source
   * GET /payment_sources/{payment_source_id}
   */
  async getPaymentSource(
    paymentSourceId: string,
  ): Promise<Either<Error, WompiPaymentSource>> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ data: WompiPaymentSource }>(
          `${this.baseUrl}/payment_sources/${paymentSourceId}`,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Failed to get payment source: ${errorMessage}`));
    }
  }

  /**
   * Create Payment Link
   * POST /payment_links
   */
  async createPaymentLink(payload: {
    name: string;
    description: string;
    redirect_url: string;
    amount_in_cents: number;
    currency: string;
  }): Promise<Either<Error, WompiPaymentLink>> {
    try {
      const response = await lastValueFrom(
        this.httpService.post<{ data: WompiPaymentLink }>(
          `${this.baseUrl}/payment_links`,
          payload,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Failed to create payment link: ${errorMessage}`));
    }
  }

  /**
   * Get Payment Link
   * GET /payment_links/{payment_link_id}
   */
  async getPaymentLink(
    paymentLinkId: string,
  ): Promise<Either<Error, WompiPaymentLink>> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ data: WompiPaymentLink }>(
          `${this.baseUrl}/payment_links/${paymentLinkId}`,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Failed to get payment link: ${errorMessage}`));
    }
  }

  /**
   * Update Payment Link (Activate/Deactivate)
   * PATCH /payment_links/{payment_link_id}
   */
  async updatePaymentLink(
    paymentLinkId: string,
    status: 'ACTIVE' | 'INACTIVE',
  ): Promise<Either<Error, WompiPaymentLink>> {
    try {
      const response = await lastValueFrom(
        this.httpService.patch<{ data: WompiPaymentLink }>(
          `${this.baseUrl}/payment_links/${paymentLinkId}`,
          { status },
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Failed to update payment link: ${errorMessage}`));
    }
  }

  /**
   * Get Merchant Info and Acceptance Token
   * GET /merchants/{merchantPublicKey}
   */
  async getMerchant(
    merchantPublicKey: string,
  ): Promise<Either<Error, WompiMerchant>> {
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ data: WompiMerchant }>(
          `${this.baseUrl}/merchants/${merchantPublicKey}`,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(new Error(`Failed to get merchant: ${errorMessage}`));
    }
  }

  /**
   * Get PSE Financial Institutions
   * GET /pse/financial_institutions
   */
  async getPSEFinancialInstitutions(): Promise<
    Either<Error, WompiFinancialInstitution[]>
  > {
    try {
      const response = await lastValueFrom(
        this.httpService.get<{ data: WompiFinancialInstitution[] }>(
          `${this.baseUrl}/pse/financial_institutions`,
          {
            headers: this.getHeaders(),
          },
        ),
      );

      return right(response.data.data);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      return left(
        new Error(`Failed to get PSE financial institutions: ${errorMessage}`),
      );
    }
  }

  // Helper Methods

  /**
   * Get HTTP headers for Wompi API
   */
  private getHeaders() {
    return {
      Authorization: `Bearer ${this.merchantPrivateKey}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Map Wompi transaction status to TransactionStatus
   */
  private mapWompiStatusToTransactionStatus(
    wompiStatus: string,
  ): TransactionStatus {
    const statusMap: Record<string, TransactionStatus> = {
      APPROVED: TransactionStatus.APPROVED,
      PENDING: TransactionStatus.PENDING,
      DECLINED: TransactionStatus.DECLINED,
      VOIDED: TransactionStatus.DECLINED,
      ERROR: TransactionStatus.DECLINED,
    };

    return statusMap[wompiStatus] || TransactionStatus.DECLINED;
  }
}
