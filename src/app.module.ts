import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsController } from './infrastructure/controllers/ProductsController';
import { TransactionsController } from './infrastructure/controllers/TransactionsController';
import { CustomersController } from './infrastructure/controllers/CustomersController';
import { DeliveriesController } from './infrastructure/controllers/DeliveriesController';
import { GetProductsUseCase } from './application/use-cases/GetProductsUseCase';
import { CreateTransactionUseCase } from './application/use-cases/CreateTransactionUseCase';
import { ProcessPaymentUseCase } from './application/use-cases/ProcessPaymentUseCase';
import { GetTransactionsUseCase } from './application/use-cases/GetTransactionsUseCase';
import { GetCustomersUseCase } from './application/use-cases/GetCustomersUseCase';
import { GetDeliveriesUseCase } from './application/use-cases/GetDeliveriesUseCase';
import { DatabaseModule } from './infrastructure/database/DatabaseModule';
import { WompiPaymentServiceImpl } from './infrastructure/external/WompiPaymentServiceImpl';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
  controllers: [
    AppController,
    ProductsController,
    TransactionsController,
    CustomersController,
    DeliveriesController,
  ],
  providers: [
    AppService,
    GetProductsUseCase,
    CreateTransactionUseCase,
    ProcessPaymentUseCase,
    GetTransactionsUseCase,
    GetCustomersUseCase,
    GetDeliveriesUseCase,
    {
      provide: 'WompiPaymentService',
      useClass: WompiPaymentServiceImpl,
    },
  ],
})
export class AppModule {}
