import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { ProductsController } from './infrastructure/controllers/ProductsController';
import { TransactionsController } from './infrastructure/controllers/TransactionsController';
import { CustomersController } from './infrastructure/controllers/CustomersController';
import { DeliveriesController } from './infrastructure/controllers/DeliveriesController';
import { AuthController } from './infrastructure/controllers/AuthController';
import { GetProductsUseCase } from './application/use-cases/GetProductsUseCase';
import { GetProductByIdUseCase } from './application/use-cases/GetProductByIdUseCase';
import { CreateTransactionUseCase } from './application/use-cases/CreateTransactionUseCase';
import { ProcessPaymentUseCase } from './application/use-cases/ProcessPaymentUseCase';
import { GetTransactionsUseCase } from './application/use-cases/GetTransactionsUseCase';
import { GetTransactionByIdUseCase } from './application/use-cases/GetTransactionByIdUseCase';
import { GetCustomersUseCase } from './application/use-cases/GetCustomersUseCase';
import { GetCustomerByIdUseCase } from './application/use-cases/GetCustomerByIdUseCase';
import { CreateCustomerUseCase } from './application/use-cases/CreateCustomerUseCase';
import { GetDeliveriesUseCase } from './application/use-cases/GetDeliveriesUseCase';
import { GetDeliveryByIdUseCase } from './application/use-cases/GetDeliveryByIdUseCase';
import { LoginUseCase } from './application/use-cases/LoginUseCase';
import { DatabaseModule } from './infrastructure/database/DatabaseModule';
import { JwtStrategy } from './infrastructure/auth/jwt.strategy';
import { TechHavenPaymentServiceImpl } from './infrastructure/external/TechHavenPaymentServiceImpl';

@Module({
  imports: [
    ConfigModule.forRoot(),
    PassportModule,
    JwtModule.register({
      secret: process.env['JWT_SECRET'] || 'tech-haven-secret-key-dev',
      signOptions: {
        expiresIn: process.env['JWT_EXPIRATION'] || ('24h' as any),
      },
    }),
    HttpModule,
    DatabaseModule,
  ],
  controllers: [
    ProductsController,
    TransactionsController,
    CustomersController,
    DeliveriesController,
    AuthController,
  ],
  providers: [
    GetProductsUseCase,
    GetProductByIdUseCase,
    CreateTransactionUseCase,
    ProcessPaymentUseCase,
    GetTransactionsUseCase,
    GetTransactionByIdUseCase,
    GetCustomersUseCase,
    GetCustomerByIdUseCase,
    CreateCustomerUseCase,
    GetDeliveriesUseCase,
    GetDeliveryByIdUseCase,
    LoginUseCase,
    JwtStrategy,
    TechHavenPaymentServiceImpl,
    {
      provide: 'TechHavenPaymentService',
      useClass: TechHavenPaymentServiceImpl,
    },
  ],
})
export class AppModule {}
