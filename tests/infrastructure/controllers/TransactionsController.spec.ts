import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TransactionsController } from '../../../src/infrastructure/controllers/TransactionsController';
import { CreateTransactionUseCase } from '../../../src/application/use-cases/CreateTransactionUseCase';
import { ProcessPaymentUseCase } from '../../../src/application/use-cases/ProcessPaymentUseCase';
import { GetTransactionsUseCase } from '../../../src/application/use-cases/GetTransactionsUseCase';
import { GetTransactionByIdUseCase } from '../../../src/application/use-cases/GetTransactionByIdUseCase';
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
    const mockGetById = { execute: jest.fn() };
    const mockCustomerRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };
    const mockProductRepo = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };
    const mockDeliveryRepo = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    const mockPaymentService = {
      processPayment: jest.fn(),
      tokenizeCard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: CreateTransactionUseCase, useValue: mockCreate },
        { provide: ProcessPaymentUseCase, useValue: mockProcess },
        { provide: GetTransactionsUseCase, useValue: mockGet },
        { provide: GetTransactionByIdUseCase, useValue: mockGetById },
        { provide: 'CustomerRepository', useValue: mockCustomerRepo },
        { provide: 'ProductRepository', useValue: mockProductRepo },
        { provide: 'DeliveryRepository', useValue: mockDeliveryRepo },
        { provide: 'TechHavenPaymentService', useValue: mockPaymentService },
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
        100,
        TransactionStatus.PENDING,
        [{ productId: 'prod-1', quantity: 1 }],
        {
          firstName: 'John',
          lastName: 'Doe',
          address: '123 Main',
          city: 'NYC',
          state: 'NY',
          postalCode: '10001',
          phone: '+1234567890',
        },
        50,
        100,
        50,
        new Date(),
        new Date(),
        'TXN-20250130-0001',
        'ORD-20250130-0001',
      ),
    ];
    mockGetUC.execute.mockResolvedValue({ _tag: 'Right', right: transactions });

    const result = await controller.getTransactions();

    expect(result).toEqual(transactions);
  });

  it('should create transaction with string productId', async () => {
    const deliveryInfo = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'City',
      state: 'State',
      postalCode: '12345',
      phone: '1234567890',
    };
    const input = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      deliveryInfo,
      items: [{ productId: '1', quantity: 1 }],
    };
    const transaction = new Transaction(
      '1',
      'cust1',
      250, // amount
      TransactionStatus.PENDING,
      [{ productId: '1', quantity: 1 }],
      deliveryInfo,
      50, // baseFee
      100, // deliveryFee
      100, // subtotal
      new Date(),
      new Date(),
      'TXN-20250130-0001',
      'ORD-20250130-0001',
    );
    mockCreateUC.execute.mockReturnValue(() =>
      Promise.resolve({ _tag: 'Right', right: transaction }),
    );

    const result = await controller.createTransaction(input);

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('TXN-20250130-0001');
    expect(result.orderId).toBe('ORD-20250130-0001');
  });

  it('should create transaction with number productId', async () => {
    const deliveryInfo = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'City',
      state: 'State',
      postalCode: '12345',
      phone: '1234567890',
    };
    const input = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      deliveryInfo,
      items: [{ productId: '1', quantity: 1 }],
    };
    const transaction = new Transaction(
      '1',
      'cust1',
      250, // amount
      TransactionStatus.PENDING,
      [{ productId: '1', quantity: 1 }],
      deliveryInfo,
      50, // baseFee
      100, // deliveryFee
      100, // subtotal
      new Date(),
      new Date(),
      'TXN-20250130-0001',
      'ORD-20250130-0001',
    );
    mockCreateUC.execute.mockReturnValue(() =>
      Promise.resolve({ _tag: 'Right', right: transaction }),
    );

    const result = await controller.createTransaction(input);

    expect(result.success).toBe(true);
    expect(result.transactionId).toBe('TXN-20250130-0001');
  });

  it('should process payment', async () => {
    const deliveryInfo = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'City',
      state: 'State',
      postalCode: '12345',
      phone: '1234567890',
    };
    const transaction = new Transaction(
      '1',
      'cust1',
      250, // amount
      TransactionStatus.APPROVED,
      [{ productId: '1', quantity: 1 }],
      deliveryInfo,
      50, // baseFee
      100, // deliveryFee
      100, // subtotal
      new Date(),
      new Date(),
      'TXN-20250130-0001',
      'ORD-20250130-0001',
    );
    mockProcessUC.execute.mockResolvedValue({
      _tag: 'Right',
      right: transaction,
    });

    const result = await controller.processPayment('1', {
      cardNumber: '4111111111111111',
      expirationMonth: 12,
      expirationYear: 2026,
      cvv: '123',
      cardholderName: 'John Doe',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBe('1');
    expect(result.status).toBe('APPROVED');
    expect(result.transactionId).toBe('TXN-20250130-0001');
    expect(result.orderId).toBe('ORD-20250130-0001');
    expect(result.cardLastFour).toBe('1111');
  });

  it('should throw error on get transactions failure', async () => {
    mockGetUC.execute.mockResolvedValue({
      _tag: 'Left',
      left: new Error('Database error'),
    });

    await expect(controller.getTransactions()).rejects.toThrow(
      'Database error',
    );
  });

  it('should throw BadRequestException on validation error', async () => {
    const deliveryInfo = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'City',
      state: 'State',
      postalCode: '12345',
      phone: '1234567890',
    };
    const input = {
      customerName: 'John',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      deliveryInfo,
      items: [{ productId: '', quantity: 1 }],
    };
    mockCreateUC.execute.mockReturnValue(() =>
      Promise.resolve({
        _tag: 'Left',
        left: new Error('productId should not be empty'),
      }),
    );

    await expect(controller.createTransaction(input)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw NotFoundException on product not found', async () => {
    const deliveryInfo = {
      firstName: 'John',
      lastName: 'Doe',
      address: '123 Main St',
      city: 'City',
      state: 'State',
      postalCode: '12345',
      phone: '1234567890',
    };
    const input = {
      customerName: 'John',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      deliveryInfo,
      items: [{ productId: '999999', quantity: 1 }],
    };
    mockCreateUC.execute.mockReturnValue(() =>
      Promise.resolve({
        _tag: 'Left',
        left: new Error('Product not found'),
      }),
    );

    await expect(controller.createTransaction(input)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw error on process payment failure', async () => {
    mockProcessUC.execute.mockResolvedValue({
      _tag: 'Left',
      left: new Error('Payment failed'),
    });

    await expect(
      controller.processPayment('1', {
        cardNumber: '4111111111111111',
        expirationMonth: 12,
        expirationYear: 2026,
        cvv: '123',
        cardholderName: 'John Doe',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
