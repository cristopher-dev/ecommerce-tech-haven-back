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
import { CreateTransactionInputDto, CardDataDto } from './dto';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all transactions' })
  @ApiResponse({ status: 200, description: 'List of transactions' })
  async getTransactions() {
    const result = await this.getTransactionsUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionInputDto })
  @ApiResponse({ status: 201, description: 'Transaction created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createTransaction(@Body() input: CreateTransactionInputDto) {
    const result = await this.createTransactionUseCase.execute(input)();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }

  @Put(':id/process-payment')
  @ApiOperation({ summary: 'Process payment for a transaction' })
  @ApiParam({ name: 'id', description: 'Transaction ID' })
  @ApiBody({ type: CardDataDto })
  @ApiResponse({ status: 200, description: 'Payment processed' })
  @ApiResponse({ status: 400, description: 'Payment failed' })
  async processPayment(@Param('id') id: string, @Body() cardData: CardDataDto) {
    const result = await this.processPaymentUseCase.execute(id, cardData);
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
