import { Inject, Injectable } from '@nestjs/common';
import { Either, left, right } from 'fp-ts/Either';
import { Product } from '../../domain/entities/Product';
import type { ProductRepository } from '../../domain/repositories/ProductRepository';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject('ProductRepository')
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string): Promise<Either<Error, Product>> {
    try {
      const product = await this.productRepository.findById(id);
      if (!product) {
        return left(new Error(`Product with id ${id} not found`));
      }
      return right(product);
    } catch (error) {
      return left(error as Error);
    }
  }
}
