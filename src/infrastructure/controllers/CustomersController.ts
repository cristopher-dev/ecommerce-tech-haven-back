import { Controller, Get } from '@nestjs/common';
import { GetCustomersUseCase } from '../../application/use-cases/GetCustomersUseCase';

@Controller('customers')
export class CustomersController {
  constructor(private readonly getCustomersUseCase: GetCustomersUseCase) {}

  @Get()
  async getCustomers() {
    const result = await this.getCustomersUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
