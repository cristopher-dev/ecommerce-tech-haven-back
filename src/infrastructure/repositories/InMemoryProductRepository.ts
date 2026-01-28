import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/Product';
import { ProductRepository } from '../../domain/repositories/ProductRepository';

@Injectable()
export class InMemoryProductRepository implements ProductRepository {
  private readonly products: Product[] = [
    new Product('1', 'Product 1', 'Description 1', 100, 10),
    new Product('2', 'Product 2', 'Description 2', 200, 5),
  ];

  async findAll(): Promise<Product[]> {
    return await Promise.resolve(this.products);
  }

  async findById(id: string): Promise<Product | null> {
    return await Promise.resolve(
      this.products.find((p) => p.id === id) || null,
    );
  }

  async updateStock(id: string, newStock: number): Promise<void> {
    const product = this.products.find((p) => p.id === id);
    if (product) {
      product.stock = newStock;
    }
    await Promise.resolve();
  }
}
