import { Test, TestingModule } from '@nestjs/testing';
import { ProcessPaymentUseCase } from '../../../src/application/use-cases/ProcessPaymentUseCase';
import { TransactionRepository } from '../../../src/domain/repositories/TransactionRepository';
import { DeliveryRepository } from '../../../src/domain/repositories/DeliveryRepository';
import { CustomerRepository } from '../../../src/domain/repositories/CustomerRepository';
import { TechHavenPaymentService } from '../../../src/application/use-cases/TechHavenPaymentService';
import {
  Transaction,
  TransactionStatus,
} from '../../../src/domain/entities/Transaction';
import {
  Delivery,
  DeliveryStatus,
} from '../../../src/domain/entities/Delivery';
import { Customer } from '../../../src/domain/entities/Customer';
import { Product } from '../../../src/domain/entities/Product';

describe('ProcessPaymentUseCase', () => {
  let useCase: ProcessPaymentUseCase;
  let mockTransactionRepo: jest.Mocked<TransactionRepository>;
  let mockDeliveryRepo: jest.Mocked<DeliveryRepository>;
  let mockProductRepo: jest.Mocked<ProductRepository>;
  let mockCustomerRepo: jest.Mocked<CustomerRepository>;

  beforeEach(async () => {
    const mockTrans = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    };
    const mockDel = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    };
    const mockProd = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };
    const mockCust = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
    };
    const mockTechHaven = {
      processPayment: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessPaymentUseCase,
        { provide: 'TransactionRepository', useValue: mockTrans },
        { provide: 'DeliveryRepository', useValue: mockDel },
        { provide: 'ProductRepository', useValue: mockProd },
        { provide: 'CustomerRepository', useValue: mockCust },
        { provide: 'TechHavenPaymentService', useValue: mockTechHaven },
      ],
    }).compile();

    useCase = module.get<ProcessPaymentUseCase>(ProcessPaymentUseCase);
    mockTransactionRepo = module.get('TransactionRepository');
    mockDeliveryRepo = module.get('DeliveryRepository');
    mockProductRepo = module.get('ProductRepository');
    mockCustomerRepo = module.get('CustomerRepository');
    mockTechHavenService = module.get('TechHavenPaymentService');
  });

  it('should process approved payment and update stock/delivery', async () => {
    const transaction = new Transaction(
      '1',
      'cust1',
      'prod1',
      100,
      TransactionStatus.PENDING,
      new Date(),
      new Date(),
    );
    const updatedTransaction = new Transaction(
      '1',
      'cust1',
      'prod1',
      100,
      TransactionStatus.APPROVED,
      new Date(),
      new Date(),
    );
    const product = new Product('prod1', 'Prod', 'Desc', 100, 5);
    const customer = new Customer(
      'cust1',
      'John Doe',
      'john@example.com',
      'Address',
    );
    const delivery = new Delivery(
      'del1',
      '1',
      'cust1',
      DeliveryStatus.PENDING,
      new Date(),
    );

    mockTransactionRepo.findById
      .mockResolvedValueOnce(transaction)
      .mockResolvedValueOnce(updatedTransaction);
    mockCustomerRepo.findById.mockResolvedValue(customer);
    mockTechHavenService.processPayment.mockResolvedValue({
      _tag: 'Right',
      right: TransactionStatus.APPROVED,
    });
    mockProductRepo.findById.mockResolvedValue(product);
    mockDeliveryRepo.create.mockResolvedValue(delivery);

    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };

    const result = await useCase.execute('1', cardData);

    expect(result._tag).toBe('Right');
    expect((result as any).right.status).toBe(TransactionStatus.APPROVED);
    expect(mockProductRepo.updateStock).toHaveBeenCalledWith('prod1', 4);
    expect(mockDeliveryRepo.create).toHaveBeenCalled();
  });

  it('should fail if transaction not found', async () => {
    mockTransactionRepo.findById.mockResolvedValue(null);

    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };

    const result = await useCase.execute('1', cardData);

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('Transaction not found');
  });

  it('should fail if customer not found', async () => {
    const transaction = new Transaction(
      '1',
      'cust1',
      'prod1',
      100,
      TransactionStatus.PENDING,
      new Date(),
      new Date(),
    );

    mockTransactionRepo.findById.mockResolvedValue(transaction);
    mockCustomerRepo.findById.mockResolvedValue(null);

    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };

    const result = await useCase.execute('1', cardData);

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('Customer not found');
  });

  it('should fail if payment processing fails', async () => {
    const transaction = new Transaction(
      '1',
      'cust1',
      'prod1',
      100,
      TransactionStatus.PENDING,
      new Date(),
      new Date(),
    );
    const customer = new Customer(
      'cust1',
      'John Doe',
      'john@example.com',
      'Address',
    );

    mockTransactionRepo.findById.mockResolvedValue(transaction);
    mockCustomerRepo.findById.mockResolvedValue(customer);
    mockTechHavenService.processPayment.mockResolvedValue({
      _tag: 'Left',
      left: new Error('Payment declined'),
    });

    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };

    const result = await useCase.execute('1', cardData);

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('Payment declined');
  });

  it('should process declined payment without updating stock/delivery', async () => {
    const transaction = new Transaction(
      '1',
      'cust1',
      'prod1',
      100,
      TransactionStatus.PENDING,
      new Date(),
      new Date(),
    );
    const updatedTransaction = new Transaction(
      '1',
      'cust1',
      'prod1',
      100,
      TransactionStatus.DECLINED,
      new Date(),
      new Date(),
    );
    const customer = new Customer(
      'cust1',
      'John Doe',
      'john@example.com',
      'Address',
    );

    mockTransactionRepo.findById
      .mockResolvedValueOnce(transaction)
      .mockResolvedValueOnce(updatedTransaction);
    mockCustomerRepo.findById.mockResolvedValue(customer);
    mockTechHavenService.processPayment.mockResolvedValue({
      _tag: 'Right',
      right: TransactionStatus.DECLINED,
    });

    const cardData = {
      number: '4111111111111111',
      expMonth: '12',
      expYear: '25',
      cvc: '123',
      cardHolder: 'Test User',
    };

    const result = await useCase.execute('1', cardData);

    expect(result._tag).toBe('Right');
    expect((result as any).right.status).toBe(TransactionStatus.DECLINED);
    expect(mockProductRepo.updateStock).not.toHaveBeenCalled();
    expect(mockDeliveryRepo.create).not.toHaveBeenCalled();
  });
});
