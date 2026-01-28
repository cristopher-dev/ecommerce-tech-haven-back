import 'reflect-metadata';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetDeliveriesUseCase } from '../../application/use-cases/GetDeliveriesUseCase';

@ApiTags('Deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly getDeliveriesUseCase: GetDeliveriesUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Get all deliveries',
    description:
      'Retrieve a list of all deliveries in the system, including their status, associated transaction and customer, and creation date.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of deliveries',
    schema: {
      example: [
        {
          id: 'del-123',
          transactionId: 'txn-123',
          customerId: 'cust-456',
          status: 'PENDING',
          createdAt: '2023-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  async getDeliveries() {
    const result = await this.getDeliveriesUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
