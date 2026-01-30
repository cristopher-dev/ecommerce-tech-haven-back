import 'reflect-metadata';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { GetDeliveriesUseCase } from '../../application/use-cases/GetDeliveriesUseCase';
import { GetDeliveryByIdUseCase } from '../../application/use-cases/GetDeliveryByIdUseCase';

@ApiTags('Deliveries')
@Controller('deliveries')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DeliveriesController {
  constructor(
    private readonly getDeliveriesUseCase: GetDeliveriesUseCase,
    private readonly getDeliveryByIdUseCase: GetDeliveryByIdUseCase,
  ) {}

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

  @Get(':id')
  @ApiOperation({
    summary: 'Get a delivery by ID',
    description: 'Retrieve detailed information about a specific delivery.',
  })
  @ApiParam({ name: 'id', description: 'Delivery ID' })
  @ApiResponse({
    status: 200,
    description: 'Delivery found',
    schema: {
      example: {
        id: 'del-123',
        transactionId: 'txn-123',
        customerId: 'cust-456',
        status: 'PENDING',
        createdAt: '2023-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Delivery not found' })
  async getDeliveryById(@Param('id') id: string) {
    const result = await this.getDeliveryByIdUseCase.execute(id);
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
