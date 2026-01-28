import 'reflect-metadata';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetCustomersUseCase } from '../../application/use-cases/GetCustomersUseCase';

@ApiTags('Customers')
@Controller('customers')
export class CustomersController {
  constructor(private readonly getCustomersUseCase: GetCustomersUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Get all customers',
    description:
      'Retrieve a list of all customers in the system, including their name, email, and address information.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of customers',
    schema: {
      example: [
        {
          id: 'cust-456',
          name: 'John Doe',
          email: 'john.doe@example.com',
          address: '123 Main St, City, Country',
        },
      ],
    },
  })
  async getCustomers() {
    const result = await this.getCustomersUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
