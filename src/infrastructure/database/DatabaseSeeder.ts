import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/ProductEntity';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  async onModuleInit() {
    await this.seedProducts();
  }

  private async seedProducts() {
    const existingProducts = await this.productRepository.count();
    if (existingProducts > 0) {
      console.log('Products already seeded, skipping...');
      return;
    }

    const products = [
      {
        id: 'prod-1',
        name: 'Laptop Gaming Pro',
        description: 'High-performance gaming laptop with RTX 4070',
        price: 2500.0,
        stock: 10,
      },
      {
        id: 'prod-2',
        name: 'Wireless Headphones',
        description: 'Noise-cancelling wireless headphones with 30h battery',
        price: 299.99,
        stock: 25,
      },
      {
        id: 'prod-3',
        name: 'Smartphone Ultra',
        description: 'Latest smartphone with 512GB storage and triple camera',
        price: 1199.0,
        stock: 15,
      },
      {
        id: 'prod-4',
        name: 'Mechanical Keyboard',
        description: 'RGB mechanical keyboard with blue switches',
        price: 149.99,
        stock: 30,
      },
      {
        id: 'prod-5',
        name: '4K Monitor 32"',
        description: '32-inch 4K UHD monitor with HDR support',
        price: 699.99,
        stock: 8,
      },
    ];

    await this.productRepository.save(products);
    console.log('Products seeded successfully!');
  }
}
