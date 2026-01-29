import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ProductsController } from './infrastructure/controllers/ProductsController';
import { TransactionsController } from './infrastructure/controllers/TransactionsController';
import { CustomersController } from './infrastructure/controllers/CustomersController';
import { DeliveriesController } from './infrastructure/controllers/DeliveriesController';
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
import { DatabaseModule } from './infrastructure/database/DatabaseModule';
import { MockTechHavenPaymentService } from './infrastructure/external/MockTechHavenPaymentService';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [
    ProductsController,
    TransactionsController,
    CustomersController,
    DeliveriesController,
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
    {
      provide: 'TechHavenPaymentService',
      useClass: MockTechHavenPaymentService,
    },
  ],
})
export class AppModule {}
