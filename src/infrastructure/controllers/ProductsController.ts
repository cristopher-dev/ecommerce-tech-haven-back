import 'reflect-metadata';
import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetProductsUseCase } from '../../application/use-cases/GetProductsUseCase';
import { GetProductByIdUseCase } from '../../application/use-cases/GetProductByIdUseCase';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getProductByIdUseCase: GetProductByIdUseCase,
  ) {}

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

  @Get(':id')
  @ApiOperation({
    summary: 'Get a product by ID',
    description:
      'Retrieve detailed information about a specific product including price and stock level.',
  })
  @ApiParam({ name: 'id', description: 'Product ID' })
  @ApiResponse({
    status: 200,
    description: 'Product found',
    schema: {
      example: {
        id: 'prod-789',
        name: 'Sample Product',
        description: 'A sample product description',
        price: 50,
        stock: 10,
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProductById(@Param('id') id: string) {
    const result = await this.getProductByIdUseCase.execute(id);
    if (result._tag === 'Left') {
      throw new HttpException(result.left.message, HttpStatus.NOT_FOUND);
    }
    return result.right;
  }
}
