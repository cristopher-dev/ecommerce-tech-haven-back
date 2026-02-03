import 'reflect-metadata';
import {
  Controller,
  Post,
  Body,
  Param,
  Put,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTransactionUseCase } from '../../application/use-cases/CreateTransactionUseCase';
import { ProcessPaymentUseCase } from '../../application/use-cases/ProcessPaymentUseCase';
import { GetTransactionsUseCase } from '../../application/use-cases/GetTransactionsUseCase';
import { GetTransactionByIdUseCase } from '../../application/use-cases/GetTransactionByIdUseCase';
import type { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';
import type { DeliveryRepository } from '../../domain/repositories/DeliveryRepository';
import type { TechHavenPaymentService } from '../../application/use-cases/TechHavenPaymentService';
import {
  CreateTransactionInputDto,
  CardDataDto,
  TransactionResponseDto,
  ProcessPaymentResponseDto,
  GetTransactionResponseDto,
  TokenizeCardResponseDto,
} from './dto';

@ApiTags('Transactions')
@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
    @Inject('CustomerRepository')
    private readonly customerRepository: CustomerRepository,
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
    @Inject('DeliveryRepository')
    private readonly deliveryRepository: DeliveryRepository,
    @Inject('TechHavenPaymentService')
    private readonly paymentService: TechHavenPaymentService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all transactions',
    description:
      'Retrieve a complete list of all transactions in the system with their current status, amount, customer information, and product details.',
    operationId: 'getTransactions',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all transactions retrieved successfully',
    schema: {
      example: [
        {
          id: 'txn_123',
          status: 'APPROVED',
          amount: 150000,
          customerId: 'cust_456',
          items: [
            {
              productId: 'prod_1',
              quantity: 2,
            },
          ],
          createdAt: '2026-02-03T10:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
  })
  async getTransactions() {
    const result = await this.getTransactionsUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }

  @Post('tokenize-card')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Tokenize a credit card',
    description:
      'Securely tokenize a credit card using Wompi payment gateway. This endpoint converts sensitive card data into a reusable token for payment processing without storing card details. Returns a token ID that can be used in subsequent payment operations.',
    operationId: 'tokenizeCard',
  })
  @ApiBody({
    type: CardDataDto,
    description: 'Credit card data to be tokenized',
    examples: {
      visa: {
        summary: 'VISA Card Example',
        value: {
          cardNumber: '4242424242424242',
          expirationMonth: 12,
          expirationYear: 2029,
          cvv: '789',
          cardholderName: 'Pedro Pérez',
        },
      },
      mastercard: {
        summary: 'Mastercard Example',
        value: {
          cardNumber: '5555555555554444',
          expirationMonth: 6,
          expirationYear: 2027,
          cvv: '123',
          cardholderName: 'Juan García',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Card tokenized successfully',
    type: TokenizeCardResponseDto,
    schema: {
      example: {
        success: true,
        tokenId: 'tok_visa_4242',
        brand: 'VISA',
        lastFour: '4242',
        expirationMonth: 12,
        expirationYear: 2029,
        createdAt: '2026-02-03T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Invalid card data, validation failed, or tokenization error',
    schema: {
      example: {
        success: false,
        error: 'Invalid card number',
        code: 'TOKENIZATION_FAILED',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
  })
  async tokenizeCard(@Body() cardData: CardDataDto): Promise<any> {
    try {
      // Get acceptance tokens first
      const acceptanceResult = await this.paymentService.getAcceptanceTokens();
      if (acceptanceResult._tag === 'Left') {
        throw new BadRequestException({
          success: false,
          error: 'Failed to get acceptance tokens',
          code: 'ACCEPTANCE_TOKEN_ERROR',
        });
      }

      const acceptanceTokens = acceptanceResult.right;

      // Tokenize the card
      const tokenResult = await this.paymentService.tokenizeCard(
        {
          cardNumber: cardData.cardNumber,
          expirationMonth: cardData.expirationMonth,
          expirationYear: cardData.expirationYear,
          cvv: cardData.cvv,
          cardholderName: cardData.cardholderName,
        },
        acceptanceTokens,
      );

      if (tokenResult._tag === 'Left') {
        throw new BadRequestException({
          success: false,
          error: tokenResult.left.message,
          code: 'TOKENIZATION_FAILED',
        });
      }

      const tokenId = tokenResult.right;

      return {
        success: true,
        tokenId,
        brand: this.extractCardBrand(cardData.cardNumber),
        lastFour: cardData.cardNumber.slice(-4),
        expirationMonth: cardData.expirationMonth,
        expirationYear: cardData.expirationYear,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException({
        success: false,
        error:
          error instanceof Error ? error.message : 'Card tokenization failed',
        code: 'TOKENIZATION_ERROR',
      });
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get transaction details',
    description:
      'Retrieve detailed information about a specific transaction including items, customer details, delivery status, and timeline events.',
    operationId: 'getTransactionById',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique transaction identifier',
    example: 'txn_123abc',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Transaction details retrieved successfully',
    type: GetTransactionResponseDto,
    schema: {
      example: {
        success: true,
        id: 'txn_123',
        transactionId: 'TXN-2026-001',
        orderId: 'ORD-2026-001',
        status: 'APPROVED',
        amount: 150000,
        items: [
          {
            productId: 'prod_1',
            name: 'Laptop Gaming',
            price: 75000,
            quantity: 2,
          },
        ],
        customer: {
          id: 'cust_456',
          name: 'Pedro Pérez',
          email: 'pedro@example.com',
        },
        delivery: {
          id: 'del_789',
          status: 'PENDING',
          estimatedDays: 3,
          carrier: 'DHL',
        },
        timeline: {
          createdAt: '2026-02-03T10:00:00.000Z',
          approvedAt: '2026-02-03T10:15:00.000Z',
          deliveryAssignedAt: '2026-02-03T10:20:00.000Z',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
    schema: {
      example: {
        success: false,
        error: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
  })
  async getTransactionById(@Param('id') id: string): Promise<any> {
    const result = await this.getTransactionByIdUseCase.execute(id);
    if (result._tag === 'Left') {
      throw new NotFoundException({
        success: false,
        error: result.left.message,
        code: 'TRANSACTION_NOT_FOUND',
      });
    }

    const transaction = result.right;
    const customer = await this.customerRepository.findById(
      transaction.customerId,
    );
    let delivery = null;

    // Try to find associated delivery
    try {
      const allDeliveries = await this.deliveryRepository.findAll();
      delivery = allDeliveries.find((d) => d.transactionId === transaction.id);
    } catch {
      // Delivery not found is okay
    }

    // Build items with product details
    const items = await Promise.all(
      transaction.items.map(async (item) => {
        const product = await this.productRepository.findById(item.productId);
        return {
          productId: item.productId,
          name: product?.name || 'Unknown Product',
          price: product?.price || 0,
          quantity: item.quantity,
        };
      }),
    );

    return {
      success: true,
      id: transaction.id,
      transactionId: transaction.transactionId || '',
      orderId: transaction.orderId || '',
      status: transaction.status,
      amount: transaction.amount,
      items,
      customer: {
        id: customer?.id || '',
        name: customer?.name || '',
        email: customer?.email || '',
      },
      delivery: delivery
        ? {
            id: delivery.id,
            status: delivery.status,
            estimatedDays: 3, // Static for now
            carrier: 'DHL', // Static for now
          }
        : null,
      timeline: {
        createdAt: transaction.createdAt.toISOString(),
        approvedAt:
          transaction.status === 'APPROVED'
            ? transaction.updatedAt.toISOString()
            : undefined,
        deliveryAssignedAt: delivery
          ? delivery.createdAt.toISOString()
          : undefined,
      },
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Create a new transaction with multiple items (shopping cart). The transaction is created with PENDING status and requires payment processing before delivery. Validates product availability and customer information.',
    operationId: 'createTransaction',
  })
  @ApiBody({
    type: CreateTransactionInputDto,
    description:
      'Transaction creation request with cart items and delivery details',
  })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully with PENDING status',
    type: TransactionResponseDto,
    schema: {
      example: {
        success: true,
        id: 'txn_123',
        transactionId: 'TXN-2026-001',
        orderId: 'ORD-2026-001',
        amount: 150000,
        status: 'PENDING',
        baseFee: 5000,
        deliveryFee: 10000,
        subtotal: 135000,
        customer: {
          id: 'cust_456',
          name: 'Pedro Pérez',
          email: 'pedro@example.com',
          address: 'Calle 123 #45, Bogotá',
        },
        items: [
          {
            productId: 'prod_1',
            name: 'Laptop Gaming',
            price: 75000,
            quantity: 2,
            total: 150000,
          },
        ],
        createdAt: '2026-02-03T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Validation error, insufficient stock, or invalid product',
    schema: {
      example: {
        success: false,
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: [
          {
            field: 'transaction',
            message: 'Product not found',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
  })
  async createTransaction(
    @Body() input: CreateTransactionInputDto,
  ): Promise<any> {
    const result = await this.createTransactionUseCase.execute(input)();
    if (result._tag === 'Left') {
      const errorMessage = result.left.message;

      // Handle specific validation errors
      if (
        errorMessage.includes('productId') ||
        errorMessage.includes('quantity') ||
        errorMessage.includes('customerName') ||
        errorMessage.includes('customerEmail') ||
        errorMessage.includes('customerAddress') ||
        errorMessage.includes('deliveryInfo') ||
        errorMessage.includes('items') ||
        errorMessage.includes('stock')
      ) {
        throw new BadRequestException({
          success: false,
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: [{ field: 'transaction', message: errorMessage }],
        });
      }

      // Handle product not found
      if (errorMessage.includes('not found')) {
        throw new NotFoundException({
          success: false,
          error: errorMessage,
          code: 'PRODUCT_NOT_FOUND',
        });
      }

      throw new BadRequestException({
        success: false,
        error: errorMessage,
        code: 'ERROR',
      });
    }

    const transaction = result.right;
    const customer = await this.customerRepository.findById(
      transaction.customerId,
    );

    // Build items with product details
    const items = await Promise.all(
      transaction.items.map(async (item) => {
        const product = await this.productRepository.findById(item.productId);
        return {
          productId: item.productId,
          name: product?.name || 'Unknown Product',
          price: product?.price || 0,
          quantity: item.quantity,
          total: (product?.price || 0) * item.quantity,
        };
      }),
    );

    return {
      success: true,
      id: transaction.id,
      transactionId: transaction.transactionId || '',
      orderId: transaction.orderId || '',
      amount: transaction.amount,
      status: transaction.status,
      baseFee: transaction.baseFee,
      deliveryFee: transaction.deliveryFee,
      subtotal: transaction.subtotal,
      customer: {
        id: customer?.id || '',
        name: customer?.name || '',
        email: customer?.email || '',
        address: customer?.address || '',
      },
      items,
      deliveryInfo: transaction.deliveryInfo,
      createdAt: transaction.createdAt.toISOString(),
    };
  }

  @Put(':id/process-payment')
  @ApiOperation({
    summary: 'Process payment for transaction',
    description:
      'Process payment for an existing transaction using credit card data. Upon successful payment, the transaction status changes to APPROVED, product stock is reduced, and a delivery is automatically assigned.',
    operationId: 'processPayment',
  })
  @ApiParam({
    name: 'id',
    description: 'Transaction ID to process payment for',
    example: 'txn_123abc',
    type: 'string',
  })
  @ApiBody({
    type: CardDataDto,
    description: 'Credit card information for payment',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully, transaction APPROVED',
    type: ProcessPaymentResponseDto,
    schema: {
      example: {
        success: true,
        id: 'txn_123',
        customerId: 'cust_456',
        amount: 150000,
        status: 'APPROVED',
        transactionId: 'TXN-2026-001',
        orderId: 'ORD-2026-001',
        items: [
          {
            productId: 'prod_1',
            quantity: 2,
            name: 'Laptop Gaming',
            price: 75000,
          },
        ],
        customer: {
          name: 'Pedro Pérez',
          email: 'pedro@example.com',
        },
        deliveryAssigned: {
          id: 'del_789',
          estimatedDays: 3,
          carrier: 'DHL',
        },
        cardLastFour: '4242',
        approvedAt: '2026-02-03T10:15:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad Request - Payment failed, invalid card data, or insufficient funds',
    schema: {
      example: {
        success: false,
        error: 'Card declined',
        code: 'PAYMENT_FAILED',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Transaction not found',
    schema: {
      example: {
        success: false,
        error: 'Transaction not found',
        code: 'TRANSACTION_NOT_FOUND',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Missing or invalid JWT token',
  })
  async processPayment(
    @Param('id') id: string,
    @Body() cardData: CardDataDto,
  ): Promise<any> {
    const result = await this.processPaymentUseCase.execute(id, cardData);
    if (result._tag === 'Left') {
      const errorMessage = result.left.message;
      if (errorMessage.includes('not found')) {
        throw new NotFoundException({
          success: false,
          error: errorMessage,
          code: 'TRANSACTION_NOT_FOUND',
        });
      }
      throw new BadRequestException({
        success: false,
        error: errorMessage,
        code: 'PAYMENT_FAILED',
      });
    }

    const transaction = result.right;
    const customer = await this.customerRepository.findById(
      transaction.customerId,
    );

    // Build items with product details
    const items = await Promise.all(
      transaction.items.map(async (item) => {
        const product = await this.productRepository.findById(item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          name: product?.name || 'Unknown Product',
          price: product?.price || 0,
        };
      }),
    );

    // Find associated delivery
    let deliveryAssigned = {
      id: '',
      estimatedDays: 0,
      carrier: '',
    };
    try {
      const allDeliveries = await this.deliveryRepository.findAll();
      const delivery = allDeliveries.find(
        (d) => d.transactionId === transaction.id,
      );
      if (delivery) {
        deliveryAssigned = {
          id: delivery.id,
          estimatedDays: 3, // Static for now
          carrier: 'DHL', // Static for now
        };
      }
    } catch {
      // Delivery not found is okay
    }

    return {
      success: true,
      id: transaction.id,
      customerId: transaction.customerId,
      amount: transaction.amount,
      status: transaction.status,
      transactionId: transaction.transactionId || '',
      orderId: transaction.orderId || '',
      items,
      customer: {
        name: customer?.name || '',
        email: customer?.email || '',
      },
      deliveryAssigned,
      cardLastFour: cardData.cardNumber.slice(-4),
      approvedAt: transaction.updatedAt.toISOString(),
    };
  }

  /**
   * Helper method to determine card brand from card number
   */
  private extractCardBrand(cardNumber: string): string {
    const cleanNumber = cardNumber.replaceAll(/\s/g, '');
    if (/^\d4\d{12}(?:\d{3})?$/.test(cleanNumber)) {
      return 'VISA';
    }
    if (/^5[1-5]\d{14}$/.test(cleanNumber)) {
      return 'MASTERCARD';
    }
    if (/^3[47]\d{13}$/.test(cleanNumber)) {
      return 'AMEX';
    }
    if (/^6(?:011|5\d{2})\d{12}$/.test(cleanNumber)) {
      return 'DISCOVER';
    }
    return 'UNKNOWN';
  }
}
