import { Controller, Get } from '@nestjs/common';
import { GetDeliveriesUseCase } from '../../application/use-cases/GetDeliveriesUseCase';

@Controller('deliveries')
export class DeliveriesController {
  constructor(private readonly getDeliveriesUseCase: GetDeliveriesUseCase) {}

  @Get()
  async getDeliveries() {
    const result = await this.getDeliveriesUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
