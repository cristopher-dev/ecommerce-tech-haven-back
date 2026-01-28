import 'reflect-metadata';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetCustomersUseCase } from '../../application/use-cases/GetCustomersUseCase';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly getCustomersUseCase: GetCustomersUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({ status: 200, description: 'List of customers' })
  async getCustomers() {
    const result = await this.getCustomersUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
