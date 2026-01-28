import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductRepository } from '../../../domain/repositories/ProductRepository';
import { Product } from '../../../domain/entities/Product';
import { ProductEntity } from '../entities/ProductEntity';

@Injectable()
export class ProductRepositoryImpl implements ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async findAll(): Promise<Product[]> {
    const entities = await this.productRepository.find();
    return entities.map(
      (entity) =>
        new Product(
          entity.id,
          entity.name,
          entity.description,
          Number(entity.price),
          entity.stock,
        ),
    );
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.productRepository.findOne({ where: { id } });
    if (!entity) return null;

    return new Product(
      entity.id,
      entity.name,
      entity.description,
      Number(entity.price),
      entity.stock,
    );
  }

  async updateStock(id: string, newStock: number): Promise<void> {
    await this.productRepository.update(id, { stock: newStock });
  }
}
