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
import {
  CreateTransactionInputDto,
  CardDataDto,
  TransactionResponseDto,
  ProcessPaymentResponseDto,
  GetTransactionResponseDto,
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
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get all transactions',
    description:
      'Retrieve a list of all transactions in the system, including their status, amount, and associated customer and product information.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of transactions',
  })
  async getTransactions() {
    const result = await this.getTransactionsUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a transaction by ID',
    description:
      'Retrieve detailed information about a specific transaction with full details including items, customer, and delivery info.',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction found',
    type: GetTransactionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
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
    summary: 'Create a new transaction (multi-product cart)',
    description:
      'Create a new transaction with multiple items. Supports cart checkout with delivery information. The transaction will be created with PENDING status.',
  })
  @ApiBody({ type: CreateTransactionInputDto })
  @ApiResponse({
    status: 201,
    description: 'Transaction created successfully',
    type: TransactionResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
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
    summary: 'Process payment for a transaction',
    description:
      'Process the payment for an existing transaction using card data. If the payment is approved, the transaction status changes to APPROVED, stock is reduced, and a delivery is assigned.',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiBody({ type: CardDataDto })
  @ApiResponse({
    status: 200,
    description: 'Payment processed successfully',
    type: ProcessPaymentResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Payment failed or invalid transaction',
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
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
}
