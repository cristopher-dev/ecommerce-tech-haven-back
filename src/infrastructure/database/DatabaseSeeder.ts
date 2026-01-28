import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/ProductEntity';
import * as fs from 'fs';
import * as path from 'path';

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

    const seedFilePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      'src',
      'infrastructure',
      'database',
      'products-seed.json',
    );
    const productsData = JSON.parse(fs.readFileSync(seedFilePath, 'utf-8'));

    await this.productRepository.save(productsData);
    console.log('Products seeded successfully!');
  }
}
