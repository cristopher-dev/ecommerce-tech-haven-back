import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from '../../../src/application/use-cases/CreateTransactionUseCase';
import { ProductRepository } from '../../../src/domain/repositories/ProductRepository';
import { TransactionRepository } from '../../../src/domain/repositories/TransactionRepository';
import { CustomerRepository } from '../../../src/domain/repositories/CustomerRepository';
import { Product } from '../../../src/domain/entities/Product';
import {
  Transaction,
  TransactionStatus,
} from '../../../src/domain/entities/Transaction';
import { Customer } from '../../../src/domain/entities/Customer';

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;
  let mockProductRepo: jest.Mocked<ProductRepository>;
  let mockTransactionRepo: jest.Mocked<TransactionRepository>;
  let mockCustomerRepo: jest.Mocked<CustomerRepository>;

  beforeEach(async () => {
    const mockProd = {
      findAll: jest.fn(),
      findById: jest.fn(),
      updateStock: jest.fn(),
    };
    const mockTrans = {
      create: jest.fn(),
      findById: jest.fn(),
      updateStatus: jest.fn(),
      findAll: jest.fn(),
    };
    const mockCust = {
      create: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        { provide: 'ProductRepository', useValue: mockProd },
        { provide: 'TransactionRepository', useValue: mockTrans },
        { provide: 'CustomerRepository', useValue: mockCust },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    mockProductRepo = module.get('ProductRepository');
    mockTransactionRepo = module.get('TransactionRepository');
    mockCustomerRepo = module.get('CustomerRepository');
  });

  it('should create transaction successfully with string productId', async () => {
    const input = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      productId: '1',
      quantity: 1,
    };
    const product = new Product('1', 'Prod', 'Desc', 100, 10);
    const customer = new Customer(
      'cust1',
      'John Doe',
      'john@example.com',
      '123 Main St, City',
    );
    const transaction = new Transaction(
      'trans1',
      'cust1',
      '1',
      100,
      TransactionStatus.PENDING,
      new Date(),
      new Date(),
      'TXN-20250130-0001',
      'ORD-20250130-0001',
      1,
    );

    mockProductRepo.findById.mockResolvedValue(product);
    mockCustomerRepo.findByEmail.mockResolvedValue(null);
    mockCustomerRepo.create.mockResolvedValue(customer);
    mockTransactionRepo.create.mockResolvedValue(transaction);

    const result = await useCase.execute(input)();

    expect(result._tag).toBe('Right');
    expect((result as any).right).toEqual(transaction);
  });

  it('should create transaction successfully with number productId', async () => {
    const input = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      productId: 1,
      quantity: 1,
    };
    const product = new Product('1', 'Prod', 'Desc', 100, 10);
    const customer = new Customer(
      'cust1',
      'John Doe',
      'john@example.com',
      '123 Main St, City',
    );
    const transaction = new Transaction(
      'trans1',
      'cust1',
      '1',
      100,
      TransactionStatus.PENDING,
      new Date(),
      new Date(),
      'TXN-20250130-0001',
      'ORD-20250130-0001',
      1,
    );

    mockProductRepo.findById.mockResolvedValue(product);
    mockCustomerRepo.findByEmail.mockResolvedValue(null);
    mockCustomerRepo.create.mockResolvedValue(customer);
    mockTransactionRepo.create.mockResolvedValue(transaction);

    const result = await useCase.execute(input)();

    expect(result._tag).toBe('Right');
    expect((result as any).right).toEqual(transaction);
  });

  it('should fail if product not found', async () => {
    const input = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      productId: '999',
      quantity: 1,
    };

    mockProductRepo.findById.mockResolvedValue(null);

    const result = await useCase.execute(input)();

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('Product not found');
  });

  it('should fail if insufficient stock', async () => {
    const input = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      productId: '1',
      quantity: 5,
    };
    const product = new Product('1', 'Prod', 'Desc', 100, 2);

    mockProductRepo.findById.mockResolvedValue(product);

    const result = await useCase.execute(input)();

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('Insufficient stock');
  });

  it('should fail if customerName is empty', async () => {
    const input = {
      customerName: '',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      productId: '1',
      quantity: 1,
    };

    const result = await useCase.execute(input)();

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe(
      'customerName should not be empty',
    );
  });

  it('should fail if productId is empty', async () => {
    const input = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      productId: '',
      quantity: 1,
    };

    const result = await useCase.execute(input)();

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('productId should not be empty');
  });

  it('should fail if quantity is invalid', async () => {
    const input = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: '123 Main St, City',
      productId: '1',
      quantity: 0,
    };

    const result = await useCase.execute(input)();

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe(
      'quantity must be positive integer',
    );
  });

  it('should fail if customerEmail is invalid', async () => {
    const input = {
      customerName: 'John Doe',
      customerEmail: 'invalid-email',
      customerAddress: '123 Main St, City',
      productId: '1',
      quantity: 1,
    };

    const result = await useCase.execute(input)();

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe(
      'customerEmail should not be empty',
    );
  });

  it('should fail if customerAddress is too short', async () => {
    const input = {
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
      customerAddress: 'St',
      productId: '1',
      quantity: 1,
    };

    const result = await useCase.execute(input)();

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe(
      'customerAddress should not be empty',
    );
  });
});
