import { Controller, Get } from '@nestjs/common';
import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';

@Controller('products')
export class ProductsController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  async getProducts() {
    const result = await this.getProductsUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
