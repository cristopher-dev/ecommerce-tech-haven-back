import { Controller, Post, Body, Param, Put, Get } from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/use-cases/CreateTransactionUseCase';
import type { CreateTransactionInput } from '../../application/use-cases/CreateTransactionUseCase';
import { ProcessPaymentUseCase } from '../../application/use-cases/ProcessPaymentUseCase';
import { GetTransactionsUseCase } from '../../application/use-cases/GetTransactionsUseCase';

@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly processPaymentUseCase: ProcessPaymentUseCase,
    private readonly getTransactionsUseCase: GetTransactionsUseCase,
  ) {}

  @Get()
  async getTransactions() {
    const result = await this.getTransactionsUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }

  @Post()
  async createTransaction(@Body() input: CreateTransactionInput) {
    const result = await this.createTransactionUseCase.execute(input)();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }

  @Put(':id/process-payment')
  async processPayment(@Param('id') id: string) {
    const result = await this.processPaymentUseCase.execute(id);
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
