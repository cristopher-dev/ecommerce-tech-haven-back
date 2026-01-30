import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  ProductEntity,
  CustomerEntity,
  TransactionEntity,
  DeliveryEntity,
  UserEntity,
} from './entities';
import {
  ProductRepositoryImpl,
  CustomerRepositoryImpl,
  TransactionRepositoryImpl,
  DeliveryRepositoryImpl,
  UserRepositoryImpl,
} from './repositories';
import { DatabaseSeeder } from './DatabaseSeeder';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger('Database');
        logger.log('🔌 Conectando a la base de datos PostgreSQL...');
        return {
          type: 'postgres',
          host: configService.get('DATABASE_HOST', 'localhost'),
          port: configService.get('DATABASE_PORT', 5432),
          username: configService.get('DATABASE_USER', 'postgres'),
          password: configService.get('DATABASE_PASSWORD', 'password'),
          database: configService.get('DATABASE_NAME', 'tech-haven_db'),
          entities: [
            ProductEntity,
            CustomerEntity,
            TransactionEntity,
            DeliveryEntity,
            UserEntity,
          ],
          synchronize: true, // Habilitar sincronización de esquema automática
          logging: configService.get('DATABASE_LOGGING', 'false') === 'true',
          retryAttempts: 5,
          retryDelay: 3000,
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      ProductEntity,
      CustomerEntity,
      TransactionEntity,
      DeliveryEntity,
      UserEntity,
    ]),
  ],
  providers: [
    DatabaseSeeder,
    {
      provide: 'ProductRepository',
      useClass: ProductRepositoryImpl,
    },
    {
      provide: 'CustomerRepository',
      useClass: CustomerRepositoryImpl,
    },
    {
      provide: 'TransactionRepository',
      useClass: TransactionRepositoryImpl,
    },
    {
      provide: 'DeliveryRepository',
      useClass: DeliveryRepositoryImpl,
    },
    {
      provide: 'UserRepository',
      useClass: UserRepositoryImpl,
    },
  ],
  exports: [
    'ProductRepository',
    'CustomerRepository',
    'TransactionRepository',
    'DeliveryRepository',
    'UserRepository',
  ],
})
export class DatabaseModule {}
