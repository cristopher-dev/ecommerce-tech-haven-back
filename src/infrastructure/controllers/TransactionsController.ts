import 'reflect-metadata';
import { Controller, Post, Body, Param, Put, Get } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CreateTransactionUseCase } from '../../application/use-cases/CreateTransactionUseCase';
import { ProcessPaymentUseCase } from '../../application/use-cases/ProcessPaymentUseCase';
import { GetTransactionsUseCase } from '../../application/use-cases/GetTransactionsUseCase';
import { GetTransactionByIdUseCase } from '../../application/use-cases/GetTransactionByIdUseCase';
import { CreateTransactionInputDto, CardDataDto } from './dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
    private readonly getTransactionByIdUseCase: GetTransactionByIdUseCase,
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
    schema: {
      example: [
        {
          id: 'txn-123',
          customerId: 'cust-456',
          productId: 'prod-789',
          amount: 100,
          status: 'PENDING',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      ],
    },
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
    description: 'Retrieve detailed information about a specific transaction.',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiResponse({
    status: 200,
    description: 'Transaction found',
    schema: {
      example: {
        id: 'txn-123',
        customerId: 'cust-456',
        productId: 'prod-789',
        amount: 100,
        status: 'PENDING',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransactionById(@Param('id') id: string) {
    const result = await this.getTransactionByIdUseCase.execute(id);
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new transaction',
    description:
      'Create a new transaction by providing customer details (name, email, address) and the product ID with quantity. The transaction will be created with PENDING status and the amount calculated based on product price and quantity.',
  })
  @ApiBody({ type: CreateTransactionInputDto })
  @ApiResponse({
    status: 201,
    description: 'Transaction created',
    schema: {
      example: {
        id: 'txn-123',
        customerId: 'cust-456',
        productId: 'prod-789',
        amount: 100,
        status: 'PENDING',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTransaction(@Body() input: CreateTransactionInputDto) {
    const result = await this.createTransactionUseCase.execute(input)();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }

  @Put(':id/process-payment')
  @ApiOperation({
    summary: 'Process payment for a transaction',
    description:
      'Process the payment for an existing transaction using card data. If the payment is approved by TechHaven, the transaction status changes to APPROVED, stock is reduced, and a delivery is assigned. If declined, status remains PENDING.',
  })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiBody({ type: CardDataDto })
  @ApiResponse({
    status: 200,
    description: 'Payment processed',
    schema: {
      example: {
        id: 'txn-123',
        customerId: 'cust-456',
        productId: 'prod-789',
        amount: 100,
        status: 'APPROVED',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Payment failed' })
  async processPayment(@Param('id') id: string, @Body() cardData: CardDataDto) {
    const result = await this.processPaymentUseCase.execute(id, cardData);
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
