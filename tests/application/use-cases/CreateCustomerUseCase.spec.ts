import { Test, TestingModule } from '@nestjs/testing';
import { CreateCustomerUseCase } from '../../../src/application/use-cases/CreateCustomerUseCase';
import { CustomerRepository } from '../../../src/domain/repositories/CustomerRepository';
import { Customer } from '../../../src/domain/entities/Customer';

describe('CreateCustomerUseCase', () => {
  let useCase: CreateCustomerUseCase;
  let mockCustomerRepository: jest.Mocked<CustomerRepository>;

  beforeEach(async () => {
    const mockRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateCustomerUseCase,
        {
          provide: 'CustomerRepository',
          useValue: mockRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateCustomerUseCase>(CreateCustomerUseCase);
    mockCustomerRepository = module.get('CustomerRepository');
  });

  it('should create a new customer successfully', async () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main St',
    };

    mockCustomerRepository.findByEmail.mockResolvedValue(null);
    mockCustomerRepository.save.mockResolvedValue(
      new Customer('cust-1', 'John Doe', 'john@example.com', '123 Main St'),
    );

    const result = await useCase.execute(input);

    expect(result._tag).toBe('Right');
    expect((result as any).right.name).toBe('John Doe');
    expect((result as any).right.email).toBe('john@example.com');
    expect(mockCustomerRepository.findByEmail).toHaveBeenCalledWith(
      'john@example.com',
    );
    expect(mockCustomerRepository.save).toHaveBeenCalled();
  });

  it('should return error if customer with email already exists', async () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main St',
    };

    mockCustomerRepository.findByEmail.mockResolvedValue(
      new Customer('cust-1', 'John Doe', 'john@example.com', '123 Main St'),
    );

    const result = await useCase.execute(input);

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toContain('already exists');
    expect(mockCustomerRepository.save).not.toHaveBeenCalled();
  });

  it('should return error when repository fails', async () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      address: '123 Main St',
    };

    mockCustomerRepository.findByEmail.mockRejectedValue(new Error('DB error'));

    const result = await useCase.execute(input);

    expect(result._tag).toBe('Left');
    expect((result as any).left.message).toBe('DB error');
  });
});
