import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ProductEntity } from './entities/ProductEntity';
import { UserEntity } from './entities/UserEntity';
import { UserRole } from '../../domain/entities/User';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'crypto';

@Injectable()
export class DatabaseSeeder implements OnModuleInit {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async onModuleInit() {
    await this.seedProducts();
    await this.seedUsers();
  }

  private async seedProducts() {
    const existingProducts = await this.productRepository.count();
    if (existingProducts > 0) {
      this.logger.log('📦 Productos ya sembrados, omitiendo...');
      return;
    }

    const seedFilePath = join(__dirname, 'products-seed.json');
    const productsData: ProductEntity[] = JSON.parse(
      readFileSync(seedFilePath, 'utf-8'),
    ) as ProductEntity[];

    await this.productRepository.save(productsData);
    this.logger.log('🌱 Productos sembrados exitosamente!');
  }

  private async seedUsers() {
    const existingUsers = await this.userRepository.count();
    if (existingUsers > 0) {
      this.logger.log('👤 Usuarios ya sembrados, omitiendo...');
      return;
    }

    const dummyUsers = [
      {
        id: randomUUID(),
        email: 'admin@techhaven.com',
        password: await bcrypt.hash('admin123', 10),
        role: UserRole.ADMIN,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        email: 'customer@techhaven.com',
        password: await bcrypt.hash('customer123', 10),
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        email: 'test@techhaven.com',
        password: await bcrypt.hash('test123', 10),
        role: UserRole.CUSTOMER,
        createdAt: new Date(),
      },
    ];

    await this.userRepository.save(dummyUsers);
    this.logger.log('🌱 Usuarios dummy sembrados exitosamente!');
    this.logger.log('📧 Admin: admin@techhaven.com / admin123');
    this.logger.log('📧 Customer: customer@techhaven.com / customer123');
    this.logger.log('📧 Test: test@techhaven.com / test123');
  }
}
