import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { Product } from '../../domain/entities/Product';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(): Promise<Either<Error, Product[]>> {
    try {
      const products = await this.productRepository.findAll();
      return right(products);
    } catch (error) {
      return left(error as Error);
    }
  }
}
