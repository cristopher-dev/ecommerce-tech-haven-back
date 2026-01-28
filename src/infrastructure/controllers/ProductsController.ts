import 'reflect-metadata';
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly getProductsUseCase: GetProductsUseCase) {}

  @Get()
  @ApiOperation({
    summary: 'Get all products',
    description:
      'Retrieve a list of all available products in the system, including their name, description, price, and current stock level.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of products',
    schema: {
      example: [
        {
          id: 'prod-789',
          name: 'Sample Product',
          description: 'A sample product description',
          price: 50,
          stock: 10,
        },
      ],
    },
  })
  async getProducts() {
    const result = await this.getProductsUseCase.execute();
    if (result._tag === 'Left') {
      throw new Error(result.left.message);
    }
    return result.right;
  }
}
