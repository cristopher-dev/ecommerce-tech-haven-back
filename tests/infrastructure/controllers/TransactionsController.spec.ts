import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from '../../../src/infrastructure/controllers/TransactionsController';
import { CreateTransactionUseCase } from '../../../src/application/use-cases/CreateTransactionUseCase';
import { ProcessPaymentUseCase } from '../../../src/application/use-cases/ProcessPaymentUseCase';
import { GetTransactionsUseCase } from '../../../src/application/use-cases/GetTransactionsUseCase';
import {
  Transaction,
  TransactionStatus,
} from '../../../src/domain/entities/Transaction';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let mockCreateUC: jest.Mocked<CreateTransactionUseCase>;
  let mockProcessUC: jest.Mocked<ProcessPaymentUseCase>;
  let mockGetUC: jest.Mocked<GetTransactionsUseCase>;

  beforeEach(async () => {
    const mockCreate = { execute: jest.fn() };
    const mockProcess = { execute: jest.fn() };
    const mockGet = { execute: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: CreateTransactionUseCase, useValue: mockCreate },
        { provide: ProcessPaymentUseCase, useValue: mockProcess },
        { provide: GetTransactionsUseCase, useValue: mockGet },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
    mockCreateUC = module.get(CreateTransactionUseCase);
    mockProcessUC = module.get(ProcessPaymentUseCase);
    mockGetUC = module.get(GetTransactionsUseCase);
  });

  it('should get transactions', async () => {
    const transactions: Transaction[] = [
      new Transaction(
        '1',
        'cust1',
        'prod1',
        100,
        TransactionStatus.PENDING,
        new Date(),
        new Date(),
      ),
    ];
    mockGetUC.execute.mockResolvedValue({ _tag: 'Right', right: transactions });

    const result = await controller.getTransactions();

    expect(result).toEqual(transactions);
  });

  it('should create transaction', async () => {
    const input = {
      customerName: 'John',
      customerEmail: 'john@example.com',
      customerAddress: 'Addr',
      productId: '1',
      quantity: 1,
    };
    const transaction = new Transaction(
      '1',
      'cust1',
      'prod1',
      100,
      TransactionStatus.PENDING,
      new Date(),
      new Date(),
    );
    mockCreateUC.execute.mockReturnValue(() =>
      Promise.resolve({ _tag: 'Right', right: transaction }),
    );

    const result = await controller.createTransaction(input);

    expect(result).toEqual(transaction);
  });

  it('should process payment', async () => {
    const transaction = new Transaction(
      '1',
      'cust1',
      'prod1',
      100,
      TransactionStatus.APPROVED,
      new Date(),
      new Date(),
    );
    mockProcessUC.execute.mockResolvedValue({
      _tag: 'Right',
      right: transaction,
    });

    const result = await controller.processPayment('1');

    expect(result).toEqual(transaction);
  });
});
