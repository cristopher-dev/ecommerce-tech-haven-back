import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from './entities/ProductEntity';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeeder.name);

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
      this.logger.log('📦 Productos ya sembrados, omitiendo...');
      return;
    }

    const seedFilePath = join(
      __dirname,
      '..',
      '..',
      '..',
      'src',
      'infrastructure',
      'database',
      'products-seed.json',
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const productsData = JSON.parse(readFileSync(seedFilePath, 'utf-8'));

    await this.productRepository.save(productsData);
    this.logger.log('🌱 Productos sembrados exitosamente!');
  }
}
