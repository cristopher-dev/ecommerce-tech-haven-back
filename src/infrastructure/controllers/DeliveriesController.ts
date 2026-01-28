import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetDeliveriesUseCase } from '../../application/use-cases/GetDeliveriesUseCase';

@ApiTags('Deliveries')
@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly getDeliveriesUseCase: GetDeliveriesUseCase) {}

  @Get()
  @ApiOperation({ summary: 'Get all deliveries' })
  @ApiResponse({ status: 200, description: 'List of deliveries' })
  async getDeliveries() {
    const result = await this.getDeliveriesUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
